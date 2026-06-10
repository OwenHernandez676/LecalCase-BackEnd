/** Puerto para emisión y verificación de tokens de sesión. */
export interface TokenPayload { sub: string; rol: string; correo: string; }

export interface TokenSigner {
  sign(payload: TokenPayload): Promise<string>;
  verify(token: string): Promise<TokenPayload>;
}
