/**
 * TypeScript declaration file for the Clint library
 * A stupidly tiny command line interface helper inspired by commander.js
 */

declare module 'clint' {
  class Clint {
    constructor();

    shortcuts: { [key: string]: string };
    rshortcuts: { [key: string]: string };
    commands: { [key: string]: string | boolean };
    parsers: { [key: string]: (arg: string) => any };

    help(indentation?: number, separator?: string): string;
    command(
      longOption: string,
      shortOption: string | null,
      message?: string,
      parse?: (arg: string) => any
    ): this;
    parse(args: string[]): this;
    go(): this;
    
    on(event: 'command', listener: (name: string, value: any) => void): this;
    on(event: 'complete', listener: () => void): this;
    on(event: 'chunk', listener: (command: string, ...args: any[]) => void): this;
    on(event: string, listener: (...args: any[]) => void): this;

    off(event: string, listener: (...args: any[]) => void): this;
    emit(event: 'command', name: string, value: any): boolean;
    emit(event: 'complete'): boolean;
    emit(event: 'chunk', command: string, ...args: any[]): boolean;
    emit(event: string, ...args: any[]): boolean;
  }

  function clint(): Clint;
  const defaultClint: Clint;

  export { clint, defaultClint };
}