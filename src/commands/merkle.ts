import {Command, Flags} from '@oclif/core'
import {MerkleTree} from 'merkletreejs'
import { ethers } from 'ethers';
import {open} from 'fs/promises'
import { keccak256 } from 'ethers/lib/utils';

async function read(path?: string) {
  const stream = path ? (await open(path, 'r')).createReadStream() : process.stdin;
  const chunks: Uint8Array[] = []
  for await (const chunk of stream) chunks.push(chunk as Uint8Array)
  return Buffer.concat(chunks).toString('utf8')
}

function hashAddress(address: string) {
  const hash = ethers.utils.solidityKeccak256(['address'], [address]);
  return Buffer.from(hash.slice(2), 'hex');
}

export default class Merkle extends Command {
  static enableJsonFlag = true;
  static description = 'describe the command here'

  static examples = [
    '<%= config.bin %> <%= command.id %>',
  ]

  static flags = {
    // flag with a value (-n, --name=VALUE)
    name: Flags.string({char: 'n', description: 'name to print'}),
    // flag with no value (-f, --force)
    force: Flags.boolean({char: 'f'}),
  }

  static args = [{name: 'file', ignoreStdin: true}]

  public async run(): Promise<any> {
    const {args, flags} = await this.parse(Merkle)

    const stdin = await read(args.file);
    const addresses = stdin.trim().split(/\s+/);
    const leaves = addresses.map(hashAddress);
    const merkleTree = new MerkleTree(leaves, (v: Buffer) => MerkleTree.bufferify(keccak256(v)), { sortPairs: true });

    const proofs: Record<string, string[]> = {};
    for (const address of addresses) {
      proofs[address] = merkleTree.getHexProof(hashAddress(address));
    }
    const rv = {
      root: merkleTree.getHexRoot(),
      proofs,
    }
    this.log('Merkle Root: %s', rv.root);
    return rv;
  }
}
