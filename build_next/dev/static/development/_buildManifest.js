self.__BUILD_MANIFEST = {
  "__rewrites": {
    "afterFiles": [
      {
        "source": "/i",
        "destination": "/icon.png"
      },
      {
        "source": "/farcaster.json",
        "destination": "/.well-known/farcaster.json"
      },
      {
        "source": "/manifest.json",
        "destination": "/api/manifest.json"
      }
    ],
    "beforeFiles": [],
    "fallback": []
  },
  "sortedPages": [
    "/_app",
    "/_error"
  ]
};self.__BUILD_MANIFEST_CB && self.__BUILD_MANIFEST_CB()