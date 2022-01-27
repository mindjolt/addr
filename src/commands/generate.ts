import { HDNode } from '@ethersproject/hdnode'
import {Command, Flags} from '@oclif/core'

export default class Generate extends Command {
  static enableJsonFlag = true;
  static description = 'Generate wallet addresses'

  static examples = [
    '<%= config.bin %> <%= command.id %> -c 20',
  ]

  static flags = {
    mnemonic: Flags.string({
      char: 'm',
      helpValue: '<mnemonic>',
      default: 'test test test test test test test test test test test junk',
      description: 'mnemonic to use'
    }),
    count: Flags.integer({char: 'c', default: 1, description: 'number of addresses to generate'}),
  }

  static args = [{name: 'file'}]

  public async run(): Promise<any> {
    const {flags} = await this.parse(Generate)

    const node = HDNode.fromMnemonic(flags.mnemonic);
    let addresses = [];
    for (let i = 0; i < flags.count; ++i) {
      const address = node.derivePath(`44'/60'/0'/0/${i}`).address;
      this.log(address);
      addresses.push(address);
    }
    return addresses;
  }
}
