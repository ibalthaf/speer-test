import * as bcrypt from 'bcrypt';
import { v1 as uuidv1 } from 'uuid';

const saltOrRounds = 10;

export async function generateHash(text: string): Promise<string> {
  return await bcrypt.hash(text, saltOrRounds);
}

export async function compareHash(
  text: string,
  hash: string,
): Promise<boolean> {
  return await bcrypt.compare(text, hash);
}

export const uuid = (): string => uuidv1();
