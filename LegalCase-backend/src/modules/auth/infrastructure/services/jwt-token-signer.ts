import * as jwt from 'jsonwebtoken';
import { TokenPayload, TokenSigner } from '../../../../shared/ports/token-signer.port';

/** Adaptador del puerto TokenSigner usando jsonwebtoken. */
export class JwtTokenSigner implements TokenSigner {
  constructor(private readonly secret: string, private readonly expiresIn: string) {}

  sign(payload: TokenPayload): Promise<string> {
    return Promise.resolve(
      jwt.sign(payload, this.secret, { expiresIn: this.expiresIn } as jwt.SignOptions),
    );
  }
  verify(token: string): Promise<TokenPayload> {
    return Promise.resolve(jwt.verify(token, this.secret) as TokenPayload);
  }
}
