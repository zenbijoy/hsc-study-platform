# HSCP v1 binary format

```text
0x00  8 bytes    ASCII "HSCP0001"
0x08  4 bytes    big-endian uint32 JSON header length N
0x0C  N bytes    UTF-8 JSON header
...   chunk data concatenated
```

Header fields:

```json
{
  "schema": 1,
  "bookId": "uuid",
  "version": 1,
  "mediaType": "application/pdf",
  "originalName": "book.pdf",
  "originalSize": 314572800,
  "chunkSize": 4194304,
  "chunks": [
    {
      "index": 0,
      "offset": 0,
      "cipherLength": 4194320,
      "plainLength": 4194304,
      "nonceLength": 12,
      "sha256": "..."
    }
  ]
}
```

Each chunk data blob is `nonce || AES-256-GCM ciphertext+tag`. AAD is UTF-8 `${bookId}:${version}:${chunkIndex}`. `offset` is relative to the beginning of the chunk data section, not the beginning of the file.

HSCP does not itself contain the content key. The worker wraps that key using a server master key and stores the wrapped key in `book_secrets`. The license Edge Function re-wraps it to the requesting device using ephemeral X25519 + HKDF-SHA256 + AES-GCM.
