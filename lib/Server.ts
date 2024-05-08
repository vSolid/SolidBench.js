import { AppRunner, type LogLevel } from "@solid/community-server";
import { join } from "node:path";

/**
 * Serves generated fragments over HTTP.
 */
export class Server {
  private readonly configPath: string;
  private readonly port: number;
  private readonly baseUrl: string | undefined;
  private readonly rootFilePath: string;
  private readonly logLevel: string;

  public constructor(options: IServerOptions) {
    this.configPath = options.configPath;
    this.port = options.port;
    this.baseUrl = options.baseUrl;
    this.rootFilePath = options.rootFilePath;
    this.logLevel = options.logLevel;
  }

  public async serve(): Promise<void> {
    return new AppRunner().run({
      loaderProperties: {
        mainModulePath: join(__dirname, ".."),
        typeChecking: false,
        logLevel: <LogLevel>this.logLevel,
      },
      config: this.configPath,
      variableBindings: {
        "urn:solid-server:default:variable:port": this.port,
        "urn:solid-server:default:variable:rootFilePath": this.rootFilePath,
        "urn:solid-server:default:variable:loggingLevel": this.logLevel,
        "urn:solid-server:default:variable:baseUrl":
          this.baseUrl ?? `http://localhost:${this.port}/`,
        "urn:solid-server:default:variable:seededPodConfigJson": "",
        "urn:solid-server:default:variable:showStackTrace": false,
      },
    });
  }
}

export interface IServerOptions {
  configPath: string;
  port: number;
  baseUrl: string | undefined;
  rootFilePath: string;
  logLevel: string;
}
