import * as fs from 'fs';
import * as Path from 'path';
import Dockerode from 'dockerode';
import { runConfig as runEnhancer } from 'ldbc-snb-enhancer';
import { runConfig as runFragmenter } from 'rdf-dataset-fragmenter';
import { runConfig as runQueryInstantiator } from 'sparql-query-parameter-instantiator';

/**
 * Generates decentralized social network data in different phases.
 */
export class Generator {
  public static readonly COLOR_RESET: string = '\u001B[0m';
  public static readonly COLOR_RED: string = '\u001B[31m';
  public static readonly COLOR_GREEN: string = '\u001B[32m';
  public static readonly COLOR_YELLOW: string = '\u001B[33m';
  public static readonly COLOR_BLUE: string = '\u001B[34m';
  public static readonly COLOR_MAGENTA: string = '\u001B[35m';
  public static readonly COLOR_CYAN: string = '\u001B[36m';
  public static readonly COLOR_GRAY: string = '\u001B[90m';

  private readonly cwd: string;
  private readonly verbose: boolean;
  private readonly overwrite: boolean;
  private readonly scale: string;
  private readonly enhancementConfig: string;
  private readonly fragmentConfig: string;
  private readonly enhancementFragmentConfig: string;
  private readonly queryConfig: string;
  private readonly hadoopMemory: string;
  private readonly mainModulePath: string;

  public constructor(opts: IGeneratorOptions) {
    this.cwd = opts.cwd;
    this.verbose = opts.verbose;
    this.overwrite = opts.overwrite;
    this.scale = opts.scale;
    this.enhancementConfig = opts.enhancementConfig;
    this.fragmentConfig = opts.fragmentConfig;
    this.enhancementFragmentConfig = opts.enhancementFragmentConfig;
    this.queryConfig = opts.queryConfig;
    this.hadoopMemory = opts.hadoopMemory;
    this.mainModulePath = Path.join(__dirname, '..');
  }

  protected async targetExists(path: string): Promise<boolean> {
    try {
      await fs.promises.stat(path);
      return true;
    } catch {
      return false;
    }
  }

  protected log(phase: string, status: string): void {
    process.stdout.write(`${Generator.withColor(`[${phase}]`, Generator.COLOR_CYAN)} ${status}\n`);
  }

  protected async runPhase(name: string, directory: string, runner: () => Promise<void>): Promise<void> {
    if (this.overwrite || !await this.targetExists(Path.join(this.cwd, directory))) {
      this.log(name, 'Started');
      const timeStart = process.hrtime();
      await runner();
      const timeEnd = process.hrtime(timeStart);
      this.log(name, `Done in ${timeEnd[0] + (timeEnd[1] / 1_000_000_000)} seconds`);
    } else {
      this.log(name, `Skipped (/${directory} already exists, remove to regenerate)`);
    }
  }

  /**
   * Run all generator phases.
   */
  public async generate(): Promise<void> {
    const timeStart = process.hrtime();
    await this.runPhase('SNB dataset generator', 'out-snb', () => this.generateSnbDataset());
    await this.runPhase('SNB dataset enhancer', 'out-enhanced', () => this.enhanceSnbDataset());
    await this.runPhase('SNB dataset fragmenter', 'out-fragments', () => this.fragmentSnbDataset());
    await this.runPhase('SPARQL query instantiator', 'out-queries', () => this.instantiateQueries());
    const timeEnd = process.hrtime(timeStart);
    this.log('All', `Done in ${timeEnd[0] + (timeEnd[1] / 1_000_000_000)} seconds`);
  }

  /**
   * Invoke the LDBC SNB generator.
   */
  public async generateSnbDataset(): Promise<void> {
    // Create params.ini file
    const paramsTemplate = await fs.promises.readFile(Path.join(__dirname, '../templates/params.ini'), 'utf8');
    const paramsPath = Path.join(this.cwd, 'params.ini');
    await fs.promises.writeFile(paramsPath, paramsTemplate.replace(/SCALE/ug, this.scale), 'utf8');

    // Start Docker container
    const dockerode = new Dockerode();
    const container = await dockerode.createContainer({
      Image: 'rubensworks/ldbc_snb_datagen:latest',
      Tty: true,
      AttachStdout: true,
      AttachStderr: true,
      Env: [ `HADOOP_CLIENT_OPTS=-Xmx${this.hadoopMemory}` ],
      HostConfig: {
        Binds: [
          `${this.cwd}/out-snb/:/opt/ldbc_snb_datagen/out`,
          `${paramsPath}:/opt/ldbc_snb_datagen/params.ini`,
        ],
      },
    });
    await container.start();

    // Stop process on force-exit
    let containerEnded = false;
    process.on('SIGINT', async() => {
      if (!containerEnded) {
        await container.kill();
        await cleanup();
      }
    });
    async function cleanup(): Promise<void> {
      await container.remove();
      await fs.promises.unlink(paramsPath);
    }

    // Attach output to stdout
    const out = await container.attach({
      stream: true,
      stdout: true,
      stderr: true,
    });
    if (this.verbose) {
      out.pipe(process.stdout);
    } else {
      out.resume();
    }

    // Wait until generation ends
    await new Promise((resolve, reject) => {
      out.on('end', resolve);
      out.on('error', reject);
    });
    containerEnded = true;

    // Cleanup
    await cleanup();
  }

  /**
   * Enhance the generated LDBC SNB dataset.
   */
  public async enhanceSnbDataset(): Promise<void> {
    // Create target directory
    await fs.promises.mkdir(Path.join(this.cwd, 'out-enhanced'));

    // Run enhancer
    await runEnhancer(this.enhancementConfig, { mainModulePath: this.mainModulePath });
  }

  /**
   * Fragment the generated and enhanced LDBC SNB datasets.
   */
  public async fragmentSnbDataset(): Promise<void> {
    // Initial fragmentation
    await runFragmenter(this.fragmentConfig, { mainModulePath: this.mainModulePath });

    // Auxiliary fragmentation
    this.log('SNB dataset fragmenter', 'Starting auxiliary phase');
    await runFragmenter(this.enhancementFragmentConfig, { mainModulePath: this.mainModulePath });
  }

  /**
   * Instantiate queries based on the LDBC SNB datasets.
   */
  public async instantiateQueries(): Promise<void> {
    // Create target directory
    await fs.promises.mkdir(Path.join(this.cwd, 'out-queries'));

    // Run instantiator
    await runQueryInstantiator(this.queryConfig, { mainModulePath: this.mainModulePath });
  }

  /**
   * Return a string in a given color
   * @param str The string that should be printed in
   * @param color A given color
   */
  public static withColor(str: any, color: string): string {
    return `${color}${str}${Generator.COLOR_RESET}`;
  }
}

export interface IGeneratorOptions {
  cwd: string;
  verbose: boolean;
  overwrite: boolean;
  scale: string;
  enhancementConfig: string;
  fragmentConfig: string;
  enhancementFragmentConfig: string;
  queryConfig: string;
  hadoopMemory: string;
}