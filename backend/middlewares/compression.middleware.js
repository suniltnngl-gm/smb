const zlib = require('zlib');

const compressResponse = (response) => {
    if (!response.body) return response;

    // Skip compression for small payloads
    if (response.body.length < 1024) return response;

    // Compress using gzip
    const compressed = zlib.gzipSync(response.body);

    return {
        ...response,
        headers: {
            ...response.headers,
            'Content-Encoding': 'gzip',
            'Content-Length': compressed.length
        },
        body: compressed.toString('base64'),
        isBase64Encoded: true
    };
};

module.exports = {
    compressResponse
};
