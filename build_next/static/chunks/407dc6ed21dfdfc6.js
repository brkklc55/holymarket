(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,145704,765321,519490,e=>{"use strict";var t=e.i(107462),r=e.i(425218),o=e.i(27500),s=e.i(656460);function n(e,n){let a,i;return(0,t.keccak256)((a="string"==typeof e?(0,s.stringToHex)(e):"string"==typeof e.raw?e.raw:(0,s.bytesToHex)(e.raw),i=(0,s.stringToHex)(`\x19Ethereum Signed Message:
${(0,o.size)(a)}`),(0,r.concat)([i,a])),n)}e.s(["hashMessage",()=>n],145704),e.s(["hashTypedData",()=>g],519490);var a=e.i(134158);e.s(["getTypesForEIP712Domain",()=>b,"serializeTypedData",()=>f,"validateTypedData",()=>w],765321);var i=e.i(349494),l=e.i(499279),c=e.i(13567),u=e.i(45710);class p extends u.BaseError{constructor({domain:e}){super(`Invalid domain "${(0,c.stringify)(e)}".`,{metaMessages:["Must be a valid EIP-712 domain."]})}}class d extends u.BaseError{constructor({primaryType:e,types:t}){super(`Invalid primary type \`${e}\` must be one of \`${JSON.stringify(Object.keys(t))}\`.`,{docsPath:"/api/glossary/Errors#typeddatainvalidprimarytypeerror",metaMessages:["Check that the primary type is a key in `types`."]})}}class h extends u.BaseError{constructor({type:e}){super(`Struct type "${e}" is invalid.`,{metaMessages:["Struct type must not be a Solidity type."],name:"InvalidStructTypeError"})}}var m=e.i(411130),y=e.i(462448);function f(e){let{domain:t,message:r,primaryType:o,types:s}=e,n=(e,t)=>{let r={...t};for(let t of e){let{name:e,type:o}=t;"address"===o&&(r[e]=r[e].toLowerCase())}return r},a=s.EIP712Domain&&t?n(s.EIP712Domain,t):{},i=(()=>{if("EIP712Domain"!==o)return n(s[o],r)})();return(0,c.stringify)({domain:a,message:i,primaryType:o,types:s})}function w(e){let{domain:t,message:r,primaryType:n,types:a}=e,c=(e,t)=>{for(let r of e){let{name:e,type:n}=r,u=t[e],p=n.match(y.integerRegex);if(p&&("number"==typeof u||"bigint"==typeof u)){let[e,t,r]=p;(0,s.numberToHex)(u,{signed:"int"===t,size:Number.parseInt(r,10)/8})}if("address"===n&&"string"==typeof u&&!(0,m.isAddress)(u))throw new l.InvalidAddressError({address:u});let d=n.match(y.bytesRegex);if(d){let[e,t]=d;if(t&&(0,o.size)(u)!==Number.parseInt(t,10))throw new i.BytesSizeMismatchError({expectedSize:Number.parseInt(t,10),givenSize:(0,o.size)(u)})}let f=a[n];f&&(function(e){if("address"===e||"bool"===e||"string"===e||e.startsWith("bytes")||e.startsWith("uint")||e.startsWith("int"))throw new h({type:e})}(n),c(f,u))}};if(a.EIP712Domain&&t){if("object"!=typeof t)throw new p({domain:t});c(a.EIP712Domain,t)}if("EIP712Domain"!==n)if(a[n])c(a[n],r);else throw new d({primaryType:n,types:a})}function b({domain:e}){return["string"==typeof e?.name&&{name:"name",type:"string"},e?.version&&{name:"version",type:"string"},("number"==typeof e?.chainId||"bigint"==typeof e?.chainId)&&{name:"chainId",type:"uint256"},e?.verifyingContract&&{name:"verifyingContract",type:"address"},e?.salt&&{name:"salt",type:"bytes32"}].filter(Boolean)}function g(e){let{domain:o={},message:s,primaryType:n}=e,a={EIP712Domain:b({domain:o}),...e.types};w({domain:o,message:s,primaryType:n,types:a});let i=["0x1901"];return o&&i.push(function({domain:e,types:t}){return k({data:e,primaryType:"EIP712Domain",types:t})}({domain:o,types:a})),"EIP712Domain"!==n&&i.push(k({data:s,primaryType:n,types:a})),(0,t.keccak256)((0,r.concat)(i))}function k({data:e,primaryType:r,types:o}){let n=function e({data:r,primaryType:o,types:n}){let i=[{type:"bytes32"}],l=[function({primaryType:e,types:r}){let o=(0,s.toHex)(function({primaryType:e,types:t}){let r="",o=function e({primaryType:t,types:r},o=new Set){let s=t.match(/^\w*/u),n=s?.[0];if(o.has(n)||void 0===r[n])return o;for(let t of(o.add(n),r[n]))e({primaryType:t.type,types:r},o);return o}({primaryType:e,types:t});for(let s of(o.delete(e),[e,...Array.from(o).sort()]))r+=`${s}(${t[s].map(({name:e,type:t})=>`${t} ${e}`).join(",")})`;return r}({primaryType:e,types:r}));return(0,t.keccak256)(o)}({primaryType:o,types:n})];for(let c of n[o]){let[o,u]=function r({types:o,name:n,type:i,value:l}){if(void 0!==o[i])return[{type:"bytes32"},(0,t.keccak256)(e({data:l,primaryType:i,types:o}))];if("bytes"===i)return[{type:"bytes32"},(0,t.keccak256)(l)];if("string"===i)return[{type:"bytes32"},(0,t.keccak256)((0,s.toHex)(l))];if(i.lastIndexOf("]")===i.length-1){let e=i.slice(0,i.lastIndexOf("[")),s=l.map(t=>r({name:n,type:e,types:o,value:t}));return[{type:"bytes32"},(0,t.keccak256)((0,a.encodeAbiParameters)(s.map(([e])=>e),s.map(([,e])=>e)))]}return[{type:i},l]}({types:n,name:c.name,type:c.type,value:r[c.name]});i.push(o),l.push(u)}return(0,a.encodeAbiParameters)(i,l)}({data:e,primaryType:r,types:o});return(0,t.keccak256)(n)}},54618,e=>{"use strict";var t,r=new Uint8Array(16);function o(){if(!t&&!(t="undefined"!=typeof crypto&&crypto.getRandomValues&&crypto.getRandomValues.bind(crypto)||"undefined"!=typeof msCrypto&&"function"==typeof msCrypto.getRandomValues&&msCrypto.getRandomValues.bind(msCrypto)))throw Error("crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported");return t(r)}e.s(["default",()=>o])},904450,e=>{"use strict";let t=/^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i;e.s(["default",0,function(e){return"string"==typeof e&&t.test(e)}],904450)},446628,465250,e=>{"use strict";for(var t=e.i(54618),r=e.i(904450),o=[],s=0;s<256;++s)o.push((s+256).toString(16).substr(1));let n=function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:0,s=(o[e[t+0]]+o[e[t+1]]+o[e[t+2]]+o[e[t+3]]+"-"+o[e[t+4]]+o[e[t+5]]+"-"+o[e[t+6]]+o[e[t+7]]+"-"+o[e[t+8]]+o[e[t+9]]+"-"+o[e[t+10]]+o[e[t+11]]+o[e[t+12]]+o[e[t+13]]+o[e[t+14]]+o[e[t+15]]).toLowerCase();if(!(0,r.default)(s))throw TypeError("Stringified UUID is invalid");return s};e.s(["default",0,n],465250),e.s(["default",0,function(e,r,o){var s=(e=e||{}).random||(e.rng||t.default)();if(s[6]=15&s[6]|64,s[8]=63&s[8]|128,r){o=o||0;for(var a=0;a<16;++a)r[o+a]=s[a];return r}return n(s)}],446628)},63166,e=>{"use strict";var t=`{
  "connect_wallet": {
    "label": "Connect Wallet",
    "wrong_network": {
      "label": "Wrong network"
    }
  },

  "intro": {
    "title": "What is a Wallet?",
    "description": "A wallet is used to send, receive, store, and display digital assets. It's also a new way to log in, without needing to create new accounts and passwords on every website.",
    "digital_asset": {
      "title": "A Home for your Digital Assets",
      "description": "Wallets are used to send, receive, store, and display digital assets like Ethereum and NFTs."
    },
    "login": {
      "title": "A New Way to Log In",
      "description": "Instead of creating new accounts and passwords on every website, just connect your wallet."
    },
    "get": {
      "label": "Get a Wallet"
    },
    "learn_more": {
      "label": "Learn More"
    }
  },

  "sign_in": {
    "label": "Verify your account",
    "description": "To finish connecting, you must sign a message in your wallet to verify that you are the owner of this account.",
    "message": {
      "send": "Sign message",
      "preparing": "Preparing message...",
      "cancel": "Cancel",
      "preparing_error": "Error preparing message, please retry!"
    },
    "signature": {
      "waiting": "Waiting for signature...",
      "verifying": "Verifying signature...",
      "signing_error": "Error signing message, please retry!",
      "verifying_error": "Error verifying signature, please retry!",
      "oops_error": "Oops, something went wrong!"
    }
  },

  "connect": {
    "label": "Connect",
    "title": "Connect a Wallet",
    "new_to_ethereum": {
      "description": "New to Ethereum wallets?",
      "learn_more": {
        "label": "Learn More"
      }
    },
    "learn_more": {
      "label": "Learn more"
    },
    "recent": "Recent",
    "status": {
      "opening": "Opening %{wallet}...",
      "connecting": "Connecting",
      "connect_mobile": "Continue in %{wallet}",
      "not_installed": "%{wallet} is not installed",
      "not_available": "%{wallet} is not available",
      "confirm": "Confirm connection in the extension",
      "confirm_mobile": "Accept connection request in the wallet"
    },
    "secondary_action": {
      "get": {
        "description": "Don't have %{wallet}?",
        "label": "GET"
      },
      "install": {
        "label": "INSTALL"
      },
      "retry": {
        "label": "RETRY"
      }
    },
    "walletconnect": {
      "description": {
        "full": "Need the official WalletConnect modal?",
        "compact": "Need the WalletConnect modal?"
      },
      "open": {
        "label": "OPEN"
      }
    }
  },

  "connect_scan": {
    "title": "Scan with %{wallet}",
    "fallback_title": "Scan with your phone"
  },

  "connector_group": {
    "installed": "Installed",
    "recommended": "Recommended",
    "other": "Other",
    "popular": "Popular",
    "more": "More",
    "others": "Others"
  },

  "get": {
    "title": "Get a Wallet",
    "action": {
      "label": "GET"
    },
    "mobile": {
      "description": "Mobile Wallet"
    },
    "extension": {
      "description": "Browser Extension"
    },
    "mobile_and_extension": {
      "description": "Mobile Wallet and Extension"
    },
    "mobile_and_desktop": {
      "description": "Mobile and Desktop Wallet"
    },
    "looking_for": {
      "title": "Not what you're looking for?",
      "mobile": {
        "description": "Select a wallet on the main screen to get started with a different wallet provider."
      },
      "desktop": {
        "compact_description": "Select a wallet on the main screen to get started with a different wallet provider.",
        "wide_description": "Select a wallet on the left to get started with a different wallet provider."
      }
    }
  },

  "get_options": {
    "title": "Get started with %{wallet}",
    "short_title": "Get %{wallet}",
    "mobile": {
      "title": "%{wallet} for Mobile",
      "description": "Use the mobile wallet to explore the world of Ethereum.",
      "download": {
        "label": "Get the app"
      }
    },
    "extension": {
      "title": "%{wallet} for %{browser}",
      "description": "Access your wallet right from your favorite web browser.",
      "download": {
        "label": "Add to %{browser}"
      }
    },
    "desktop": {
      "title": "%{wallet} for %{platform}",
      "description": "Access your wallet natively from your powerful desktop.",
      "download": {
        "label": "Add to %{platform}"
      }
    }
  },

  "get_mobile": {
    "title": "Install %{wallet}",
    "description": "Scan with your phone to download on iOS or Android",
    "continue": {
      "label": "Continue"
    }
  },

  "get_instructions": {
    "mobile": {
      "connect": {
        "label": "Connect"
      },
      "learn_more": {
        "label": "Learn More"
      }
    },
    "extension": {
      "refresh": {
        "label": "Refresh"
      },
      "learn_more": {
        "label": "Learn More"
      }
    },
    "desktop": {
      "connect": {
        "label": "Connect"
      },
      "learn_more": {
        "label": "Learn More"
      }
    }
  },

  "chains": {
    "title": "Switch Networks",
    "wrong_network": "Wrong network detected, switch or disconnect to continue.",
    "confirm": "Confirm in Wallet",
    "switching_not_supported": "Your wallet does not support switching networks from %{appName}. Try switching networks from within your wallet instead.",
    "switching_not_supported_fallback": "Your wallet does not support switching networks from this app. Try switching networks from within your wallet instead.",
    "disconnect": "Disconnect",
    "connected": "Connected"
  },

  "profile": {
    "disconnect": {
      "label": "Disconnect"
    },
    "copy_address": {
      "label": "Copy Address",
      "copied": "Copied!"
    },
    "explorer": {
      "label": "View more on explorer"
    },
    "transactions": {
      "description": "%{appName} transactions will appear here...",
      "description_fallback": "Your transactions will appear here...",
      "recent": {
        "title": "Recent Transactions"
      },
      "clear": {
        "label": "Clear All"
      }
    }
  },

  "wallet_connectors": {
    "ready": {
      "qr_code": {
        "step1": {
          "description": "Add Ready to your home screen for faster access to your wallet.",
          "title": "Open the Ready app"
        },
        "step2": {
          "description": "Create a wallet and username, or import an existing wallet.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "After you scan, a connection prompt will appear for you to connect your wallet.",
          "title": "Tap the Scan QR button"
        }
      }
    },

    "berasig": {
      "extension": {
        "step1": {
          "title": "Install the BeraSig extension",
          "description": "We recommend pinning BeraSig to your taskbar for easier access to your wallet."
        },
        "step2": {
          "title": "Create a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone."
        },
        "step3": {
          "title": "Refresh your browser",
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension."
        }
      }
    },

    "best": {
      "qr_code": {
        "step1": {
          "title": "Open the Best Wallet app",
          "description": "Add Best Wallet to your home screen for faster access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Create a new wallet or import an existing one."
        },
        "step3": {
          "title": "Tap the QR icon and scan",
          "description": "Tap the QR icon on your homescreen, scan the code and confirm the prompt to connect."
        }
      }
    },

    "bifrost": {
      "qr_code": {
        "step1": {
          "description": "We recommend putting Bifrost Wallet on your home screen for quicker access.",
          "title": "Open the Bifrost Wallet app"
        },
        "step2": {
          "description": "Create or import a wallet using your recovery phrase.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "After you scan, a connection prompt will appear for you to connect your wallet.",
          "title": "Tap the scan button"
        }
      }
    },

    "bitget": {
      "qr_code": {
        "step1": {
          "description": "We recommend putting Bitget Wallet on your home screen for quicker access.",
          "title": "Open the Bitget Wallet app"
        },
        "step2": {
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "After you scan, a connection prompt will appear for you to connect your wallet.",
          "title": "Tap the scan button"
        }
      },

      "extension": {
        "step1": {
          "description": "We recommend pinning Bitget Wallet to your taskbar for quicker access to your wallet.",
          "title": "Install the Bitget Wallet extension"
        },
        "step2": {
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension.",
          "title": "Refresh your browser"
        }
      }
    },

    "bitski": {
      "extension": {
        "step1": {
          "description": "We recommend pinning Bitski to your taskbar for quicker access to your wallet.",
          "title": "Install the Bitski extension"
        },
        "step2": {
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension.",
          "title": "Refresh your browser"
        }
      }
    },

    "bitverse": {
      "qr_code": {
        "step1": {
          "title": "Open the Bitverse Wallet app",
          "description": "Add Bitverse Wallet to your home screen for faster access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Create a new wallet or import an existing one."
        },
        "step3": {
          "title": "Tap the QR icon and scan",
          "description": "Tap the QR icon on your homescreen, scan the code and confirm the prompt to connect."
        }
      }
    },

    "bloom": {
      "desktop": {
        "step1": {
          "title": "Open the Bloom Wallet app",
          "description": "We recommend putting Bloom Wallet on your home screen for quicker access."
        },
        "step2": {
          "description": "Create or import a wallet using your recovery phrase.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "After you have a wallet, click on Connect to connect via Bloom. A connection prompt in the app will appear for you to confirm the connection.",
          "title": "Click on Connect"
        }
      }
    },

    "bybit": {
      "qr_code": {
        "step1": {
          "description": "We recommend putting Bybit on your home screen for faster access to your wallet.",
          "title": "Open the Bybit app"
        },
        "step2": {
          "description": "You can easily backup your wallet using our backup feature on your phone.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "After you scan, a connection prompt will appear for you to connect your wallet.",
          "title": "Tap the scan button"
        }
      },

      "extension": {
        "step1": {
          "description": "Click at the top right of your browser and pin Bybit Wallet for easy access.",
          "title": "Install the Bybit Wallet extension"
        },
        "step2": {
          "description": "Create a new wallet or import an existing one.",
          "title": "Create or Import a wallet"
        },
        "step3": {
          "description": "Once you set up Bybit Wallet, click below to refresh the browser and load up the extension.",
          "title": "Refresh your browser"
        }
      }
    },

    "binance": {
      "qr_code": {
        "step1": {
          "description": "We recommend putting Binance on your home screen for faster access to your wallet.",
          "title": "Open the Binance app"
        },
        "step2": {
          "description": "You can easily backup your wallet using our backup feature on your phone.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "After you scan, a connection prompt will appear for you to connect your wallet.",
          "title": "Tap the WalletConnect button"
        }
      },
      "extension": {
        "step1": {
          "title": "Install the Binance Wallet extension",
          "description": "We recommend pinning Binance Wallet to your taskbar for quicker access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone."
        },
        "step3": {
          "title": "Refresh your browser",
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension."
        }
      }
    },

    "coin98": {
      "qr_code": {
        "step1": {
          "description": "We recommend putting Coin98 Wallet on your home screen for faster access to your wallet.",
          "title": "Open the Coin98 Wallet app"
        },
        "step2": {
          "description": "You can easily backup your wallet using our backup feature on your phone.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "After you scan, a connection prompt will appear for you to connect your wallet.",
          "title": "Tap the WalletConnect button"
        }
      },

      "extension": {
        "step1": {
          "description": "Click at the top right of your browser and pin Coin98 Wallet for easy access.",
          "title": "Install the Coin98 Wallet extension"
        },
        "step2": {
          "description": "Create a new wallet or import an existing one.",
          "title": "Create or Import a wallet"
        },
        "step3": {
          "description": "Once you set up Coin98 Wallet, click below to refresh the browser and load up the extension.",
          "title": "Refresh your browser"
        }
      }
    },

    "coinbase": {
      "qr_code": {
        "step1": {
          "description": "We recommend putting Coinbase Wallet on your home screen for quicker access.",
          "title": "Open the Coinbase Wallet app"
        },
        "step2": {
          "description": "You can easily backup your wallet using the cloud backup feature.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "After you scan, a connection prompt will appear for you to connect your wallet.",
          "title": "Tap the scan button"
        }
      },

      "extension": {
        "step1": {
          "description": "We recommend pinning Coinbase Wallet to your taskbar for quicker access to your wallet.",
          "title": "Install the Coinbase Wallet extension"
        },
        "step2": {
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension.",
          "title": "Refresh your browser"
        }
      }
    },

    "compass": {
      "extension": {
        "step1": {
          "description": "We recommend pinning Compass Wallet to your taskbar for quicker access to your wallet.",
          "title": "Install the Compass Wallet extension"
        },
        "step2": {
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension.",
          "title": "Refresh your browser"
        }
      }
    },

    "core": {
      "qr_code": {
        "step1": {
          "description": "We recommend putting Core on your home screen for faster access to your wallet.",
          "title": "Open the Core app"
        },
        "step2": {
          "description": "You can easily backup your wallet using our backup feature on your phone.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "After you scan, a connection prompt will appear for you to connect your wallet.",
          "title": "Tap the WalletConnect button"
        }
      },

      "extension": {
        "step1": {
          "description": "We recommend pinning Core to your taskbar for quicker access to your wallet.",
          "title": "Install the Core extension"
        },
        "step2": {
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension.",
          "title": "Refresh your browser"
        }
      }
    },

    "fox": {
      "qr_code": {
        "step1": {
          "description": "We recommend putting FoxWallet on your home screen for quicker access.",
          "title": "Open the FoxWallet app"
        },
        "step2": {
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "After you scan, a connection prompt will appear for you to connect your wallet.",
          "title": "Tap the scan button"
        }
      }
    },

    "frontier": {
      "qr_code": {
        "step1": {
          "description": "We recommend putting Frontier Wallet on your home screen for quicker access.",
          "title": "Open the Frontier Wallet app"
        },
        "step2": {
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "After you scan, a connection prompt will appear for you to connect your wallet.",
          "title": "Tap the scan button"
        }
      },

      "extension": {
        "step1": {
          "description": "We recommend pinning Frontier Wallet to your taskbar for quicker access to your wallet.",
          "title": "Install the Frontier Wallet extension"
        },
        "step2": {
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension.",
          "title": "Refresh your browser"
        }
      }
    },

    "im_token": {
      "qr_code": {
        "step1": {
          "title": "Open the imToken app",
          "description": "Put imToken app on your home screen for faster access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Create a new wallet or import an existing one."
        },
        "step3": {
          "title": "Tap Scanner Icon in top right corner",
          "description": "Choose New Connection, then scan the QR code and confirm the prompt to connect."
        }
      }
    },

    "iopay": {
      "qr_code": {
        "step1": {
          "description": "We recommend putting ioPay on your home screen for faster access to your wallet.",
          "title": "Open the ioPay app"
        },
        "step2": {
          "description": "You can easily backup your wallet using our backup feature on your phone.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "After you scan, a connection prompt will appear for you to connect your wallet.",
          "title": "Tap the WalletConnect button"
        }
      }
    },

    "kaikas": {
      "extension": {
        "step1": {
          "description": "We recommend pinning Kaikas to your taskbar for quicker access to your wallet.",
          "title": "Install the Kaikas extension"
        },
        "step2": {
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension.",
          "title": "Refresh your browser"
        }
      },
      "qr_code": {
        "step1": {
          "title": "Open the Kaikas app",
          "description": "Put Kaikas app on your home screen for faster access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Create a new wallet or import an existing one."
        },
        "step3": {
          "title": "Tap Scanner Icon in top right corner",
          "description": "Choose New Connection, then scan the QR code and confirm the prompt to connect."
        }
      }
    },

    "kaia": {
      "extension": {
        "step1": {
          "description": "We recommend pinning Kaia to your taskbar for quicker access to your wallet.",
          "title": "Install the Kaia extension"
        },
        "step2": {
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension.",
          "title": "Refresh your browser"
        }
      },
      "qr_code": {
        "step1": {
          "title": "Open the Kaia app",
          "description": "Put Kaia app on your home screen for faster access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Create a new wallet or import an existing one."
        },
        "step3": {
          "title": "Tap Scanner Icon in top right corner",
          "description": "Choose New Connection, then scan the QR code and confirm the prompt to connect."
        }
      }
    },

    "kraken": {
      "qr_code": {
        "step1": {
          "title": "Open the Kraken Wallet app",
          "description": "Add Kraken Wallet to your home screen for faster access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Create a new wallet or import an existing one."
        },
        "step3": {
          "title": "Tap the QR icon and scan",
          "description": "Tap the QR icon on your homescreen, scan the code and confirm the prompt to connect."
        }
      }
    },

    "kresus": {
      "qr_code": {
        "step1": {
          "title": "Open the Kresus Wallet app",
          "description": "Add Kresus Wallet to your home screen for faster access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Create a new wallet or import an existing one."
        },
        "step3": {
          "title": "Tap the QR icon and scan",
          "description": "Tap the QR icon on your homescreen, scan the code and confirm the prompt to connect."
        }
      }
    },

    "magicEden": {
      "extension": {
        "step1": {
          "title": "Install the Magic Eden extension",
          "description": "We recommend pinning Magic Eden to your taskbar for easier access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret recovery phrase with anyone."
        },
        "step3": {
          "title": "Refresh your browser",
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension."
        }
      }
    },

    "metamask": {
      "qr_code": {
        "step1": {
          "title": "Open the MetaMask app",
          "description": "We recommend putting MetaMask on your home screen for quicker access."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone."
        },
        "step3": {
          "title": "Tap the scan button",
          "description": "After you scan, a connection prompt will appear for you to connect your wallet."
        }
      },

      "extension": {
        "step1": {
          "title": "Install the MetaMask extension",
          "description": "We recommend pinning MetaMask to your taskbar for quicker access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone."
        },
        "step3": {
          "title": "Refresh your browser",
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension."
        }
      }
    },

    "nestwallet": {
      "extension": {
        "step1": {
          "title": "Install the NestWallet extension",
          "description": "We recommend pinning NestWallet to your taskbar for quicker access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone."
        },
        "step3": {
          "title": "Refresh your browser",
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension."
        }
      }
    },

    "okx": {
      "qr_code": {
        "step1": {
          "title": "Open the OKX Wallet app",
          "description": "We recommend putting OKX Wallet on your home screen for quicker access."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone."
        },
        "step3": {
          "title": "Tap the scan button",
          "description": "After you scan, a connection prompt will appear for you to connect your wallet."
        }
      },

      "extension": {
        "step1": {
          "title": "Install the OKX Wallet extension",
          "description": "We recommend pinning OKX Wallet to your taskbar for quicker access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone."
        },
        "step3": {
          "title": "Refresh your browser",
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension."
        }
      }
    },

    "omni": {
      "qr_code": {
        "step1": {
          "title": "Open the Omni app",
          "description": "Add Omni to your home screen for faster access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Create a new wallet or import an existing one."
        },
        "step3": {
          "title": "Tap the QR icon and scan",
          "description": "Tap the QR icon on your home screen, scan the code and confirm the prompt to connect."
        }
      }
    },

    "1inch": {
      "qr_code": {
        "step1": {
          "description": "Put 1inch Wallet on your home screen for faster access to your wallet.",
          "title": "Open the 1inch Wallet app"
        },
        "step2": {
          "description": "Create a wallet and username, or import an existing wallet.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "After you scan, a connection prompt will appear for you to connect your wallet.",
          "title": "Tap the Scan QR button"
        }
      }
    },

    "token_pocket": {
      "qr_code": {
        "step1": {
          "title": "Open the TokenPocket app",
          "description": "We recommend putting TokenPocket on your home screen for quicker access."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone."
        },
        "step3": {
          "title": "Tap the scan button",
          "description": "After you scan, a connection prompt will appear for you to connect your wallet."
        }
      },

      "extension": {
        "step1": {
          "title": "Install the TokenPocket extension",
          "description": "We recommend pinning TokenPocket to your taskbar for quicker access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone."
        },
        "step3": {
          "title": "Refresh your browser",
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension."
        }
      }
    },

    "trust": {
      "qr_code": {
        "step1": {
          "title": "Open the Trust Wallet app",
          "description": "Put Trust Wallet on your home screen for faster access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Create a new wallet or import an existing one."
        },
        "step3": {
          "title": "Tap WalletConnect in Settings",
          "description": "Choose New Connection, then scan the QR code and confirm the prompt to connect."
        }
      },

      "extension": {
        "step1": {
          "title": "Install the Trust Wallet extension",
          "description": "Click at the top right of your browser and pin Trust Wallet for easy access."
        },
        "step2": {
          "title": "Create or Import a wallet",
          "description": "Create a new wallet or import an existing one."
        },
        "step3": {
          "title": "Refresh your browser",
          "description": "Once you set up Trust Wallet, click below to refresh the browser and load up the extension."
        }
      }
    },

    "uniswap": {
      "qr_code": {
        "step1": {
          "title": "Open the Uniswap app",
          "description": "Add Uniswap Wallet to your home screen for faster access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Create a new wallet or import an existing one."
        },
        "step3": {
          "title": "Tap the QR icon and scan",
          "description": "Tap the QR icon on your homescreen, scan the code and confirm the prompt to connect."
        }
      }
    },

    "zerion": {
      "qr_code": {
        "step1": {
          "title": "Open the Zerion app",
          "description": "We recommend putting Zerion on your home screen for quicker access."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone."
        },
        "step3": {
          "title": "Tap the scan button",
          "description": "After you scan, a connection prompt will appear for you to connect your wallet."
        }
      },

      "extension": {
        "step1": {
          "title": "Install the Zerion extension",
          "description": "We recommend pinning Zerion to your taskbar for quicker access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone."
        },
        "step3": {
          "title": "Refresh your browser",
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension."
        }
      }
    },

    "rainbow": {
      "qr_code": {
        "step1": {
          "title": "Open the Rainbow app",
          "description": "We recommend putting Rainbow on your home screen for faster access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "You can easily backup your wallet using our backup feature on your phone."
        },
        "step3": {
          "title": "Tap the scan button",
          "description": "After you scan, a connection prompt will appear for you to connect your wallet."
        }
      }
    },

    "enkrypt": {
      "extension": {
        "step1": {
          "description": "We recommend pinning Enkrypt Wallet to your taskbar for quicker access to your wallet.",
          "title": "Install the Enkrypt Wallet extension"
        },
        "step2": {
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension.",
          "title": "Refresh your browser"
        }
      }
    },

    "frame": {
      "extension": {
        "step1": {
          "description": "We recommend pinning Frame to your taskbar for quicker access to your wallet.",
          "title": "Install Frame & the companion extension"
        },
        "step2": {
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension.",
          "title": "Refresh your browser"
        }
      }
    },

    "one_key": {
      "extension": {
        "step1": {
          "title": "Install the OneKey Wallet extension",
          "description": "We recommend pinning OneKey Wallet to your taskbar for quicker access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone."
        },
        "step3": {
          "title": "Refresh your browser",
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension."
        }
      }
    },

    "paraswap": {
      "qr_code": {
        "step1": {
          "title": "Open the ParaSwap app",
          "description": "Add ParaSwap Wallet to your home screen for faster access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Create a new wallet or import an existing one."
        },
        "step3": {
          "title": "Tap the QR icon and scan",
          "description": "Tap the QR icon on your homescreen, scan the code and confirm the prompt to connect."
        }
      }
    },

    "phantom": {
      "extension": {
        "step1": {
          "title": "Install the Phantom extension",
          "description": "We recommend pinning Phantom to your taskbar for easier access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret recovery phrase with anyone."
        },
        "step3": {
          "title": "Refresh your browser",
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension."
        }
      }
    },

    "rabby": {
      "extension": {
        "step1": {
          "title": "Install the Rabby extension",
          "description": "We recommend pinning Rabby to your taskbar for quicker access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone."
        },
        "step3": {
          "title": "Refresh your browser",
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension."
        }
      }
    },

    "ronin": {
      "qr_code": {
        "step1": {
          "description": "We recommend putting Ronin Wallet on your home screen for quicker access.",
          "title": "Open the Ronin Wallet app"
        },
        "step2": {
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "After you scan, a connection prompt will appear for you to connect your wallet.",
          "title": "Tap the scan button"
        }
      },

      "extension": {
        "step1": {
          "description": "We recommend pinning Ronin Wallet to your taskbar for quicker access to your wallet.",
          "title": "Install the Ronin Wallet extension"
        },
        "step2": {
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension.",
          "title": "Refresh your browser"
        }
      }
    },

    "ramper": {
      "extension": {
        "step1": {
          "title": "Install the Ramper extension",
          "description": "We recommend pinning Ramper to your taskbar for easier access to your wallet."
        },
        "step2": {
          "title": "Create a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone."
        },
        "step3": {
          "title": "Refresh your browser",
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension."
        }
      }
    },

    "safeheron": {
      "extension": {
        "step1": {
          "title": "Install the Core extension",
          "description": "We recommend pinning Safeheron to your taskbar for quicker access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone."
        },
        "step3": {
          "title": "Refresh your browser",
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension."
        }
      }
    },

    "taho": {
      "extension": {
        "step1": {
          "title": "Install the Taho extension",
          "description": "We recommend pinning Taho to your taskbar for quicker access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone."
        },
        "step3": {
          "title": "Refresh your browser",
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension."
        }
      }
    },

    "wigwam": {
      "extension": {
        "step1": {
          "title": "Install the Wigwam extension",
          "description": "We recommend pinning Wigwam to your taskbar for quicker access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone."
        },
        "step3": {
          "title": "Refresh your browser",
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension."
        }
      }
    },

    "talisman": {
      "extension": {
        "step1": {
          "title": "Install the Talisman extension",
          "description": "We recommend pinning Talisman to your taskbar for quicker access to your wallet."
        },
        "step2": {
          "title": "Create or Import an Ethereum Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your recovery phrase with anyone."
        },
        "step3": {
          "title": "Refresh your browser",
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension."
        }
      }
    },

    "ctrl": {
      "extension": {
        "step1": {
          "title": "Install the CTRL Wallet extension",
          "description": "We recommend pinning CTRL Wallet to your taskbar for quicker access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone."
        },
        "step3": {
          "title": "Refresh your browser",
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension."
        }
      }
    },

    "zeal": {
      "qr_code": {
        "step1": {
          "title": "Open the Zeal app",
          "description": "Add Zeal Wallet to your home screen for faster access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Create a new wallet or import an existing one."
        },
        "step3": {
          "title": "Tap the QR icon and scan",
          "description": "Tap the QR icon on your homescreen, scan the code and confirm the prompt to connect."
        }
      },
      "extension": {
        "step1": {
          "title": "Install the Zeal extension",
          "description": "We recommend pinning Zeal to your taskbar for quicker access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone."
        },
        "step3": {
          "title": "Refresh your browser",
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension."
        }
      }
    },

    "safepal": {
      "extension": {
        "step1": {
          "title": "Install the SafePal Wallet extension",
          "description": "Click at the top right of your browser and pin SafePal Wallet for easy access."
        },
        "step2": {
          "title": "Create or Import a wallet",
          "description": "Create a new wallet or import an existing one."
        },
        "step3": {
          "title": "Refresh your browser",
          "description": "Once you set up SafePal Wallet, click below to refresh the browser and load up the extension."
        }
      },
      "qr_code": {
        "step1": {
          "title": "Open the SafePal Wallet app",
          "description": "Put SafePal Wallet on your home screen for faster access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Create a new wallet or import an existing one."
        },
        "step3": {
          "title": "Tap WalletConnect in Settings",
          "description": "Choose New Connection, then scan the QR code and confirm the prompt to connect."
        }
      }
    },

    "desig": {
      "extension": {
        "step1": {
          "title": "Install the Desig extension",
          "description": "We recommend pinning Desig to your taskbar for easier access to your wallet."
        },
        "step2": {
          "title": "Create a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone."
        },
        "step3": {
          "title": "Refresh your browser",
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension."
        }
      }
    },

    "subwallet": {
      "extension": {
        "step1": {
          "title": "Install the SubWallet extension",
          "description": "We recommend pinning SubWallet to your taskbar for quicker access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your recovery phrase with anyone."
        },
        "step3": {
          "title": "Refresh your browser",
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension."
        }
      },
      "qr_code": {
        "step1": {
          "title": "Open the SubWallet app",
          "description": "We recommend putting SubWallet on your home screen for quicker access."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone."
        },
        "step3": {
          "title": "Tap the scan button",
          "description": "After you scan, a connection prompt will appear for you to connect your wallet."
        }
      }
    },

    "clv": {
      "extension": {
        "step1": {
          "title": "Install the CLV Wallet extension",
          "description": "We recommend pinning CLV Wallet to your taskbar for quicker access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone."
        },
        "step3": {
          "title": "Refresh your browser",
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension."
        }
      },
      "qr_code": {
        "step1": {
          "title": "Open the CLV Wallet app",
          "description": "We recommend putting CLV Wallet on your home screen for quicker access."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone."
        },
        "step3": {
          "title": "Tap the scan button",
          "description": "After you scan, a connection prompt will appear for you to connect your wallet."
        }
      }
    },

    "okto": {
      "qr_code": {
        "step1": {
          "title": "Open the Okto app",
          "description": "Add Okto to your home screen for quick access"
        },
        "step2": {
          "title": "Create an MPC Wallet",
          "description": "Create an account and generate a wallet"
        },
        "step3": {
          "title": "Tap WalletConnect in Settings",
          "description": "Tap the Scan QR icon at the top right and confirm the prompt to connect."
        }
      }
    },

    "ledger": {
      "desktop": {
        "step1": {
          "title": "Open the Ledger Live app",
          "description": "We recommend putting Ledger Live on your home screen for quicker access."
        },
        "step2": {
          "title": "Set up your Ledger",
          "description": "Set up a new Ledger or connect to an existing one."
        },
        "step3": {
          "title": "Connect",
          "description": "A connection prompt will appear for you to connect your wallet."
        }
      },
      "qr_code": {
        "step1": {
          "title": "Open the Ledger Live app",
          "description": "We recommend putting Ledger Live on your home screen for quicker access."
        },
        "step2": {
          "title": "Set up your Ledger",
          "description": "You can either sync with the desktop app or connect your Ledger."
        },
        "step3": {
          "title": "Scan the code",
          "description": "Tap WalletConnect then Switch to Scanner. After you scan, a connection prompt will appear for you to connect your wallet."
        }
      }
    },

    "valora": {
      "qr_code": {
        "step1": {
          "title": "Open the Valora app",
          "description": "We recommend putting Valora on your home screen for quicker access."
        },
        "step2": {
          "title": "Create or import a wallet",
          "description": "Create a new wallet or import an existing one."
        },
        "step3": {
          "title": "Tap the scan button",
          "description": "After you scan, a connection prompt will appear for you to connect your wallet."
        }
      }
    },

    "gate": {
      "qr_code": {
        "step1": {
          "title": "Open the Gate app",
          "description": "We recommend putting Gate on your home screen for quicker access."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Create a new wallet or import an existing one."
        },
        "step3": {
          "title": "Tap the scan button",
          "description": "After you scan, a connection prompt will appear for you to connect your wallet."
        }
      },
      "extension": {
        "step1": {
          "title": "Install the Gate extension",
          "description": "We recommend pinning Gate to your taskbar for easier access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret recovery phrase with anyone."
        },
        "step3": {
          "title": "Refresh your browser",
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension."
        }
      }
    },

    "gemini": {
      "qr_code": {
        "step1": {
          "title": "Open keys.gemini.com",
          "description": "Visit keys.gemini.com on your mobile browser - no app download required."
        },
        "step2": {
          "title": "Create Your Wallet Instantly",
          "description": "Set up your smart wallet in seconds using your device's built-in authentication."
        },
        "step3": {
          "title": "Scan to Connect",
          "description": "Scan the QR code to instantly connect your wallet - it just works."
        }
      },
      "extension": {
        "step1": {
          "title": "Go to keys.gemini.com",
          "description": "No extensions or downloads needed - your wallet lives securely in the browser."
        },
        "step2": {
          "title": "One-Click Setup",
          "description": "Create your smart wallet instantly with passkey authentication - easier than any wallet out there."
        },
        "step3": {
          "title": "Connect and Go",
          "description": "Approve the connection and you're ready - the unopinionated wallet that just works."
        }
      }
    },

    "xportal": {
      "qr_code": {
        "step1": {
          "description": "Put xPortal on your home screen for faster access to your wallet.",
          "title": "Open the xPortal app"
        },
        "step2": {
          "description": "Create a wallet or import an existing one.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "After you scan, a connection prompt will appear for you to connect your wallet.",
          "title": "Tap the Scan QR button"
        }
      }
    },

    "mew": {
      "qr_code": {
        "step1": {
          "description": "We recommend putting MEW Wallet on your home screen for quicker access.",
          "title": "Open the MEW Wallet app"
        },
        "step2": {
          "description": "You can easily backup your wallet using the cloud backup feature.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "After you scan, a connection prompt will appear for you to connect your wallet.",
          "title": "Tap the scan button"
        }
      }
    },

    "zilpay": {
      "qr_code": {
        "step1": {
          "title": "Open the ZilPay app",
          "description": "Add ZilPay to your home screen for faster access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Create a new wallet or import an existing one."
        },
        "step3": {
          "title": "Tap the scan button",
          "description": "After you scan, a connection prompt will appear for you to connect your wallet."
        }
      }
    },

    "nova": {
      "qr_code": {
        "step1": {
          "title": "Open the Nova Wallet app",
          "description": "Add Nova Wallet to your home screen for faster access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Create a new wallet or import an existing one."
        },
        "step3": {
          "title": "Tap the scan button",
          "description": "After you scan, a connection prompt will appear for you to connect your wallet."
        }
      }
    }
  }
}
`;e.s(["en_US_default",()=>t])},984535,e=>{"use strict";var t=e.i(911541),r=e.i(966611);e.i(553227);var o=e.i(13218);function s({children:e}){let[s,n]=(0,r.useState)(!1);return(0,r.useEffect)(()=>{let e=async()=>{await o.sdk.actions.ready(),n(!0)};o.sdk&&!s&&e()},[s]),(0,t.jsx)(t.Fragment,{children:e})}e.s(["default",()=>s])},960408,e=>{"use strict";var t=e.i(911541),r=e.i(966611);let o="holymarket_terms_v1";function s({children:e}){let[s,n]=(0,r.useState)(!1),[a,i]=(0,r.useState)(!1),[l,c]=(0,r.useState)(!1);(0,r.useEffect)(()=>{try{let e=window.localStorage.getItem(o);"accepted"===e&&i(!0)}finally{n(!0)}},[]),(0,r.useEffect)(()=>{if(s&&!a)return document.documentElement.style.overflow="hidden",document.body.style.overflow="hidden",()=>{document.documentElement.style.overflow="",document.body.style.overflow=""}},[s,a]);let u=(0,r.useMemo)(()=>({title:"Disclaimer & Terms",subtitle:"Please read and accept before using the app.",sections:[{title:"Beta / Testnet",body:"HolyMarket is a beta test running on Base Sepolia. The app, smart contracts, points system and UI may change or break at any time."},{title:"No financial advice",body:"Nothing in this app constitutes financial advice, investment advice or a recommendation. You are solely responsible for your actions."},{title:"Risk & loss",body:"Using smart contracts involves risk, including loss of funds due to bugs, exploits, incorrect transactions or network issues. Only use testnet funds you can afford to lose."},{title:"Protocol fee",body:"Winnings claims include a 5% protocol fee, deducted from claimable winnings."},{title:"Points & airdrop eligibility",body:"Points are tracked for testing and may be used for potential future airdrop eligibility. Points have no guaranteed value and may be reset, adjusted, removed or invalidated at any time."},{title:"Privacy",body:"Wallet addresses and on-chain activity are public by design. Off-chain points are stored locally on the server during testing."}]}),[]);return s?a?(0,t.jsx)(t.Fragment,{children:e}):(0,t.jsxs)("div",{className:"fixed inset-0 z-[9999]",children:[(0,t.jsx)("div",{className:"absolute inset-0 bg-slate-950/70 backdrop-blur-sm"}),(0,t.jsx)("div",{className:"relative h-full w-full flex items-center justify-center p-6",children:(0,t.jsxs)("div",{className:"w-full max-w-2xl premium-card p-6 sm:p-8 bg-slate-950/90 border border-slate-800 max-h-[90vh] overflow-y-auto overscroll-contain",children:[(0,t.jsxs)("div",{className:"flex items-start justify-between gap-4",children:[(0,t.jsxs)("div",{className:"flex gap-4",children:[(0,t.jsx)("img",{src:"/icon.png",alt:"HolyMarket Logo",className:"w-16 h-16 rounded-2xl shadow-lg border border-slate-800"}),(0,t.jsxs)("div",{children:[(0,t.jsx)("div",{className:"text-[10px] font-black text-sky-400 uppercase tracking-[0.25em]",children:"BETA ACCESS"}),(0,t.jsx)("h2",{className:"mt-2 text-2xl font-black text-white",children:u.title}),(0,t.jsx)("p",{className:"mt-2 text-sm text-slate-400",children:u.subtitle})]})]}),(0,t.jsx)("span",{className:"px-2 py-1 rounded-full bg-amber-500/10 text-amber-400 text-[10px] font-black border border-amber-500/20",children:"TESTNET"})]}),(0,t.jsx)("div",{className:"mt-6 pr-2 custom-scrollbar",children:(0,t.jsx)("div",{className:"space-y-4",children:u.sections.map(e=>(0,t.jsxs)("div",{className:"p-4 rounded-2xl bg-slate-900/40 border border-slate-800",children:[(0,t.jsx)("div",{className:"text-sm font-extrabold text-white",children:e.title}),(0,t.jsx)("div",{className:"mt-1 text-[12px] leading-relaxed text-slate-400",children:e.body})]},e.title))})}),(0,t.jsxs)("div",{className:"mt-6 p-4 rounded-2xl bg-slate-900/40 border border-slate-800",children:[(0,t.jsxs)("label",{className:"flex items-start gap-3 cursor-pointer",children:[(0,t.jsx)("input",{type:"checkbox",checked:l,onChange:e=>c(e.target.checked),className:"mt-1 h-4 w-4"}),(0,t.jsx)("div",{className:"text-[12px] text-slate-300",children:"I have read and understand the disclaimer. I agree to the terms and acknowledge the risks."})]}),(0,t.jsxs)("div",{className:"mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3",children:[(0,t.jsxs)("a",{href:"https://sepolia.basescan.org",target:"_blank",rel:"noreferrer",className:"p-3 rounded-xl bg-slate-950/30 border border-slate-800 hover:border-slate-700 transition-all text-center",children:[(0,t.jsx)("div",{className:"text-[10px] font-bold text-slate-500 uppercase tracking-widest",children:"Explorer"}),(0,t.jsx)("div",{className:"mt-1 text-sm font-black text-slate-200",children:"BaseScan (Sepolia)"})]}),(0,t.jsxs)("a",{href:"https://portal.cdp.coinbase.com/products/faucet",target:"_blank",rel:"noreferrer",className:"p-3 rounded-xl bg-slate-950/30 border border-slate-800 hover:border-slate-700 transition-all text-center",children:[(0,t.jsx)("div",{className:"text-[10px] font-bold text-slate-500 uppercase tracking-widest",children:"Faucet"}),(0,t.jsx)("div",{className:"mt-1 text-sm font-black text-slate-200",children:"Get Test ETH"})]})]})]}),(0,t.jsx)("div",{className:"mt-6 flex flex-col sm:flex-row gap-3 sm:justify-end",children:(0,t.jsx)("button",{type:"button",disabled:!l,onClick:()=>{try{window.localStorage.setItem(o,"accepted")}finally{i(!0)}},className:"premium-btn py-3 px-5 disabled:opacity-60 disabled:cursor-not-allowed",children:"Accept & Continue"})}),(0,t.jsx)("div",{className:"mt-4 text-[11px] text-slate-600",children:"By continuing you confirm you are using the beta version on testnet and accept the disclaimer."})]})})]}):(0,t.jsx)("div",{className:"flex items-center justify-center p-20",children:(0,t.jsx)("div",{className:"w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"})})}e.s(["default",()=>s])},193374,(e,t,r)=>{},251879,(e,t,r)=>{var o=e.i(689052);e.r(193374);var s=e.r(966611),n=s&&"object"==typeof s&&"default"in s?s:{default:s},a=void 0!==o.default&&o.default.env&&!0,i=function(e){return"[object String]"===Object.prototype.toString.call(e)},l=function(){function e(e){var t=void 0===e?{}:e,r=t.name,o=void 0===r?"stylesheet":r,s=t.optimizeForSpeed,n=void 0===s?a:s;c(i(o),"`name` must be a string"),this._name=o,this._deletedRulePlaceholder="#"+o+"-deleted-rule____{}",c("boolean"==typeof n,"`optimizeForSpeed` must be a boolean"),this._optimizeForSpeed=n,this._serverSheet=void 0,this._tags=[],this._injected=!1,this._rulesCount=0;var l="undefined"!=typeof window&&document.querySelector('meta[property="csp-nonce"]');this._nonce=l?l.getAttribute("content"):null}var t,r=e.prototype;return r.setOptimizeForSpeed=function(e){c("boolean"==typeof e,"`setOptimizeForSpeed` accepts a boolean"),c(0===this._rulesCount,"optimizeForSpeed cannot be when rules have already been inserted"),this.flush(),this._optimizeForSpeed=e,this.inject()},r.isOptimizeForSpeed=function(){return this._optimizeForSpeed},r.inject=function(){var e=this;if(c(!this._injected,"sheet already injected"),this._injected=!0,"undefined"!=typeof window&&this._optimizeForSpeed){this._tags[0]=this.makeStyleTag(this._name),this._optimizeForSpeed="insertRule"in this.getSheet(),this._optimizeForSpeed||(a||console.warn("StyleSheet: optimizeForSpeed mode not supported falling back to standard mode."),this.flush(),this._injected=!0);return}this._serverSheet={cssRules:[],insertRule:function(t,r){return"number"==typeof r?e._serverSheet.cssRules[r]={cssText:t}:e._serverSheet.cssRules.push({cssText:t}),r},deleteRule:function(t){e._serverSheet.cssRules[t]=null}}},r.getSheetForTag=function(e){if(e.sheet)return e.sheet;for(var t=0;t<document.styleSheets.length;t++)if(document.styleSheets[t].ownerNode===e)return document.styleSheets[t]},r.getSheet=function(){return this.getSheetForTag(this._tags[this._tags.length-1])},r.insertRule=function(e,t){if(c(i(e),"`insertRule` accepts only strings"),"undefined"==typeof window)return"number"!=typeof t&&(t=this._serverSheet.cssRules.length),this._serverSheet.insertRule(e,t),this._rulesCount++;if(this._optimizeForSpeed){var r=this.getSheet();"number"!=typeof t&&(t=r.cssRules.length);try{r.insertRule(e,t)}catch(t){return a||console.warn("StyleSheet: illegal rule: \n\n"+e+"\n\nSee https://stackoverflow.com/q/20007992 for more info"),-1}}else{var o=this._tags[t];this._tags.push(this.makeStyleTag(this._name,e,o))}return this._rulesCount++},r.replaceRule=function(e,t){if(this._optimizeForSpeed||"undefined"==typeof window){var r="undefined"!=typeof window?this.getSheet():this._serverSheet;if(t.trim()||(t=this._deletedRulePlaceholder),!r.cssRules[e])return e;r.deleteRule(e);try{r.insertRule(t,e)}catch(o){a||console.warn("StyleSheet: illegal rule: \n\n"+t+"\n\nSee https://stackoverflow.com/q/20007992 for more info"),r.insertRule(this._deletedRulePlaceholder,e)}}else{var o=this._tags[e];c(o,"old rule at index `"+e+"` not found"),o.textContent=t}return e},r.deleteRule=function(e){if("undefined"==typeof window)return void this._serverSheet.deleteRule(e);if(this._optimizeForSpeed)this.replaceRule(e,"");else{var t=this._tags[e];c(t,"rule at index `"+e+"` not found"),t.parentNode.removeChild(t),this._tags[e]=null}},r.flush=function(){this._injected=!1,this._rulesCount=0,"undefined"!=typeof window?(this._tags.forEach(function(e){return e&&e.parentNode.removeChild(e)}),this._tags=[]):this._serverSheet.cssRules=[]},r.cssRules=function(){var e=this;return"undefined"==typeof window?this._serverSheet.cssRules:this._tags.reduce(function(t,r){return r?t=t.concat(Array.prototype.map.call(e.getSheetForTag(r).cssRules,function(t){return t.cssText===e._deletedRulePlaceholder?null:t})):t.push(null),t},[])},r.makeStyleTag=function(e,t,r){t&&c(i(t),"makeStyleTag accepts only strings as second parameter");var o=document.createElement("style");this._nonce&&o.setAttribute("nonce",this._nonce),o.type="text/css",o.setAttribute("data-"+e,""),t&&o.appendChild(document.createTextNode(t));var s=document.head||document.getElementsByTagName("head")[0];return r?s.insertBefore(o,r):s.appendChild(o),o},t=[{key:"length",get:function(){return this._rulesCount}}],function(e,t){for(var r=0;r<t.length;r++){var o=t[r];o.enumerable=o.enumerable||!1,o.configurable=!0,"value"in o&&(o.writable=!0),Object.defineProperty(e,o.key,o)}}(e.prototype,t),e}();function c(e,t){if(!e)throw Error("StyleSheet: "+t+".")}var u=function(e){for(var t=5381,r=e.length;r;)t=33*t^e.charCodeAt(--r);return t>>>0},p={};function d(e,t){if(!t)return"jsx-"+e;var r=String(t),o=e+r;return p[o]||(p[o]="jsx-"+u(e+"-"+r)),p[o]}function h(e,t){"undefined"==typeof window&&(t=t.replace(/\/style/gi,"\\/style"));var r=e+t;return p[r]||(p[r]=t.replace(/__jsx-style-dynamic-selector/g,e)),p[r]}var m=function(){function e(e){var t=void 0===e?{}:e,r=t.styleSheet,o=void 0===r?null:r,s=t.optimizeForSpeed,n=void 0!==s&&s;this._sheet=o||new l({name:"styled-jsx",optimizeForSpeed:n}),this._sheet.inject(),o&&"boolean"==typeof n&&(this._sheet.setOptimizeForSpeed(n),this._optimizeForSpeed=this._sheet.isOptimizeForSpeed()),this._fromServer=void 0,this._indices={},this._instancesCounts={}}var t=e.prototype;return t.add=function(e){var t=this;void 0===this._optimizeForSpeed&&(this._optimizeForSpeed=Array.isArray(e.children),this._sheet.setOptimizeForSpeed(this._optimizeForSpeed),this._optimizeForSpeed=this._sheet.isOptimizeForSpeed()),"undefined"==typeof window||this._fromServer||(this._fromServer=this.selectFromServer(),this._instancesCounts=Object.keys(this._fromServer).reduce(function(e,t){return e[t]=0,e},{}));var r=this.getIdAndRules(e),o=r.styleId,s=r.rules;if(o in this._instancesCounts){this._instancesCounts[o]+=1;return}var n=s.map(function(e){return t._sheet.insertRule(e)}).filter(function(e){return -1!==e});this._indices[o]=n,this._instancesCounts[o]=1},t.remove=function(e){var t=this,r=this.getIdAndRules(e).styleId;if(function(e,t){if(!e)throw Error("StyleSheetRegistry: "+t+".")}(r in this._instancesCounts,"styleId: `"+r+"` not found"),this._instancesCounts[r]-=1,this._instancesCounts[r]<1){var o=this._fromServer&&this._fromServer[r];o?(o.parentNode.removeChild(o),delete this._fromServer[r]):(this._indices[r].forEach(function(e){return t._sheet.deleteRule(e)}),delete this._indices[r]),delete this._instancesCounts[r]}},t.update=function(e,t){this.add(t),this.remove(e)},t.flush=function(){this._sheet.flush(),this._sheet.inject(),this._fromServer=void 0,this._indices={},this._instancesCounts={}},t.cssRules=function(){var e=this,t=this._fromServer?Object.keys(this._fromServer).map(function(t){return[t,e._fromServer[t]]}):[],r=this._sheet.cssRules();return t.concat(Object.keys(this._indices).map(function(t){return[t,e._indices[t].map(function(e){return r[e].cssText}).join(e._optimizeForSpeed?"":"\n")]}).filter(function(e){return!!e[1]}))},t.styles=function(e){var t,r;return t=this.cssRules(),void 0===(r=e)&&(r={}),t.map(function(e){var t=e[0],o=e[1];return n.default.createElement("style",{id:"__"+t,key:"__"+t,nonce:r.nonce?r.nonce:void 0,dangerouslySetInnerHTML:{__html:o}})})},t.getIdAndRules=function(e){var t=e.children,r=e.dynamic,o=e.id;if(r){var s=d(o,r);return{styleId:s,rules:Array.isArray(t)?t.map(function(e){return h(s,e)}):[h(s,t)]}}return{styleId:d(o),rules:Array.isArray(t)?t:[t]}},t.selectFromServer=function(){return Array.prototype.slice.call(document.querySelectorAll('[id^="__jsx-"]')).reduce(function(e,t){return e[t.id.slice(2)]=t,e},{})},e}(),y=s.createContext(null);function f(){return new m}function w(){return s.useContext(y)}y.displayName="StyleSheetContext";var b=n.default.useInsertionEffect||n.default.useLayoutEffect,g="undefined"!=typeof window?f():void 0;function k(e){var t=g||w();return t&&("undefined"==typeof window?t.add(e):b(function(){return t.add(e),function(){t.remove(e)}},[e.id,String(e.dynamic)])),null}k.dynamic=function(e){return e.map(function(e){return d(e[0],e[1])}).join(" ")},r.StyleRegistry=function(e){var t=e.registry,r=e.children,o=s.useContext(y),a=s.useState(function(){return o||t||f()})[0];return n.default.createElement(y.Provider,{value:a},r)},r.createStyleRegistry=f,r.style=k,r.useStyleRegistry=w},289043,(e,t,r)=>{t.exports=e.r(251879).style},135923,e=>{"use strict";var t=e.i(911541),r=e.i(289043),o=e.i(966611),s=e.i(993719);function n({children:e}){let[n,a]=(0,o.useState)(!0),[i,l]=(0,o.useState)(1);return((0,o.useEffect)(()=>{let e=setTimeout(()=>{l(0),setTimeout(()=>{a(!1)},1e3)},2e3);return()=>clearTimeout(e)},[]),n)?(0,t.jsxs)("div",{style:{opacity:i,pointerEvents:0===i?"none":"auto"},className:"jsx-dd80c488f1e91866 fixed inset-0 z-[9999] bg-[#020617] flex items-center justify-center overflow-hidden transition-opacity duration-1000 ease-in-out",children:[(0,t.jsx)("div",{className:"jsx-dd80c488f1e91866 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/10 blur-[150px] rounded-full animate-pulse"}),(0,t.jsx)("div",{className:"jsx-dd80c488f1e91866 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-sky-500/5 blur-[100px] rounded-full"}),(0,t.jsxs)("div",{className:"jsx-dd80c488f1e91866 relative z-10 flex flex-col items-center",children:[(0,t.jsxs)("div",{className:"jsx-dd80c488f1e91866 relative group animate-in zoom-in duration-1000 ease-out",children:[(0,t.jsx)("div",{className:"jsx-dd80c488f1e91866 absolute -inset-8 bg-gradient-to-tr from-blue-500/20 to-sky-500/20 blur-2xl rounded-full group-hover:opacity-100 transition-opacity"}),(0,t.jsx)("img",{src:"/app-icon.png",alt:"HolyMarket Logo",className:"jsx-dd80c488f1e91866 w-40 h-40 md:w-48 md:h-48 rounded-[2.5rem] shadow-[0_0_50px_rgba(14,165,233,0.3)] relative border border-white/10"}),(0,t.jsx)("div",{className:"jsx-dd80c488f1e91866 absolute -top-3 -right-3 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center shadow-lg animate-bounce",children:(0,t.jsx)(s.Sparkles,{size:20,className:"text-white"})})]}),(0,t.jsxs)("div",{className:"jsx-dd80c488f1e91866 mt-10 text-center space-y-4 animate-in fade-in slide-in-from-bottom-6 duration-1000",children:[(0,t.jsxs)("h1",{className:"jsx-dd80c488f1e91866 text-5xl md:text-6xl font-black tracking-tighter text-white",children:["HOLY",(0,t.jsx)("span",{className:"jsx-dd80c488f1e91866 text-gradient",children:"MARKET"})]}),(0,t.jsxs)("div",{className:"jsx-dd80c488f1e91866 flex items-center gap-4 justify-center",children:[(0,t.jsx)("div",{className:"jsx-dd80c488f1e91866 h-px w-12 bg-white/10"}),(0,t.jsx)("p",{className:"jsx-dd80c488f1e91866 text-[12px] text-slate-500 font-extrabold uppercase tracking-[0.5em]",children:"Predict The Future"}),(0,t.jsx)("div",{className:"jsx-dd80c488f1e91866 h-px w-12 bg-white/10"})]})]}),(0,t.jsxs)("div",{className:"jsx-dd80c488f1e91866 mt-16 flex flex-col items-center gap-6",children:[(0,t.jsx)("div",{className:"jsx-dd80c488f1e91866 w-64 h-1.5 bg-white/5 rounded-full overflow-hidden relative border border-white/5",children:(0,t.jsx)("div",{className:"jsx-dd80c488f1e91866 absolute inset-0 bg-gradient-to-r from-transparent via-blue-500 to-transparent w-full animate-progress-flow"})}),(0,t.jsxs)("div",{className:"jsx-dd80c488f1e91866 flex flex-col items-center gap-2",children:[(0,t.jsx)("span",{className:"jsx-dd80c488f1e91866 text-[10px] font-black text-blue-500/60 uppercase tracking-[0.3em]",children:"Initialising Protocol"}),(0,t.jsxs)("div",{className:"jsx-dd80c488f1e91866 flex gap-1",children:[(0,t.jsx)("div",{className:"jsx-dd80c488f1e91866 w-1 h-1 bg-blue-500/40 rounded-full animate-pulse"}),(0,t.jsx)("div",{className:"jsx-dd80c488f1e91866 w-1 h-1 bg-blue-500/40 rounded-full animate-pulse [animation-delay:200ms]"}),(0,t.jsx)("div",{className:"jsx-dd80c488f1e91866 w-1 h-1 bg-blue-500/40 rounded-full animate-pulse [animation-delay:400ms]"})]})]})]})]}),(0,t.jsx)(r.default,{id:"dd80c488f1e91866",children:"@keyframes progress-flow{0%{transform:translate(-100%)}to{transform:translate(100%)}}.animate-progress-flow.jsx-dd80c488f1e91866{animation:2.5s ease-in-out infinite progress-flow}.text-gradient.jsx-dd80c488f1e91866{-webkit-text-fill-color:transparent;background:linear-gradient(135deg,#38bdf8 0%,#0ea5e9 100%);-webkit-background-clip:text;background-clip:text}"})]}):(0,t.jsx)(t.Fragment,{children:e})}e.s(["default",()=>n])},412679,e=>{"use strict";var t=e.i(911541),r=e.i(899272),o=e.i(358824),s=e.i(995469),n=e.i(844117),a=e.i(562336),i=e.i(140960),l=e.i(836686),c=e.i(91056),u=e.i(759979),p=class extends u.Subscribable{constructor(e={}){super(),this.config=e,this.#e=new Map}#e;build(e,t,r){let o=t.queryKey,s=t.queryHash??(0,i.hashQueryKeyByOptions)(o,t),n=this.get(s);return n||(n=new l.Query({client:e,queryKey:o,queryHash:s,options:e.defaultQueryOptions(t),state:r,defaultOptions:e.getQueryDefaults(o)}),this.add(n)),n}add(e){this.#e.has(e.queryHash)||(this.#e.set(e.queryHash,e),this.notify({type:"added",query:e}))}remove(e){let t=this.#e.get(e.queryHash);t&&(e.destroy(),t===e&&this.#e.delete(e.queryHash),this.notify({type:"removed",query:e}))}clear(){c.notifyManager.batch(()=>{this.getAll().forEach(e=>{this.remove(e)})})}get(e){return this.#e.get(e)}getAll(){return[...this.#e.values()]}find(e){let t={exact:!0,...e};return this.getAll().find(e=>(0,i.matchQuery)(t,e))}findAll(e={}){let t=this.getAll();return Object.keys(e).length>0?t.filter(t=>(0,i.matchQuery)(e,t)):t}notify(e){c.notifyManager.batch(()=>{this.listeners.forEach(t=>{t(e)})})}onFocus(){c.notifyManager.batch(()=>{this.getAll().forEach(e=>{e.onFocus()})})}onOnline(){c.notifyManager.batch(()=>{this.getAll().forEach(e=>{e.onOnline()})})}},d=e.i(811364),h=u,m=class extends h.Subscribable{constructor(e={}){super(),this.config=e,this.#t=new Set,this.#r=new Map,this.#o=0}#t;#r;#o;build(e,t,r){let o=new d.Mutation({client:e,mutationCache:this,mutationId:++this.#o,options:e.defaultMutationOptions(t),state:r});return this.add(o),o}add(e){this.#t.add(e);let t=y(e);if("string"==typeof t){let r=this.#r.get(t);r?r.push(e):this.#r.set(t,[e])}this.notify({type:"added",mutation:e})}remove(e){if(this.#t.delete(e)){let t=y(e);if("string"==typeof t){let r=this.#r.get(t);if(r)if(r.length>1){let t=r.indexOf(e);-1!==t&&r.splice(t,1)}else r[0]===e&&this.#r.delete(t)}}this.notify({type:"removed",mutation:e})}canRun(e){let t=y(e);if("string"!=typeof t)return!0;{let r=this.#r.get(t),o=r?.find(e=>"pending"===e.state.status);return!o||o===e}}runNext(e){let t=y(e);if("string"!=typeof t)return Promise.resolve();{let r=this.#r.get(t)?.find(t=>t!==e&&t.state.isPaused);return r?.continue()??Promise.resolve()}}clear(){c.notifyManager.batch(()=>{this.#t.forEach(e=>{this.notify({type:"removed",mutation:e})}),this.#t.clear(),this.#r.clear()})}getAll(){return Array.from(this.#t)}find(e){let t={exact:!0,...e};return this.getAll().find(e=>(0,i.matchMutation)(t,e))}findAll(e={}){return this.getAll().filter(t=>(0,i.matchMutation)(e,t))}notify(e){c.notifyManager.batch(()=>{this.listeners.forEach(t=>{t(e)})})}resumePausedMutations(){let e=this.getAll().filter(e=>e.state.isPaused);return c.notifyManager.batch(()=>Promise.all(e.map(e=>e.continue().catch(i.noop))))}};function y(e){return e.options.scope?.id}var f=e.i(659771),w=e.i(986223);function b(e){return{onFetch:(t,r)=>{let o=t.options,s=t.fetchOptions?.meta?.fetchMore?.direction,n=t.state.data?.pages||[],a=t.state.data?.pageParams||[],l={pages:[],pageParams:[]},c=0,u=async()=>{let r=!1,u=(0,i.ensureQueryFn)(t.options,t.fetchOptions),p=async(e,o,s)=>{let n;if(r)return Promise.reject();if(null==o&&e.pages.length)return Promise.resolve(e);let a=(Object.defineProperty(n={client:t.client,queryKey:t.queryKey,pageParam:o,direction:s?"backward":"forward",meta:t.options.meta},"signal",{enumerable:!0,get:()=>(t.signal.aborted?r=!0:t.signal.addEventListener("abort",()=>{r=!0}),t.signal)}),n),l=await u(a),{maxPages:c}=t.options,p=s?i.addToStart:i.addToEnd;return{pages:p(e.pages,l,c),pageParams:p(e.pageParams,o,c)}};if(s&&n.length){let e="backward"===s,t={pages:n,pageParams:a},r=(e?function(e,{pages:t,pageParams:r}){return t.length>0?e.getPreviousPageParam?.(t[0],t,r[0],r):void 0}:g)(o,t);l=await p(t,r,e)}else{let t=e??n.length;do{let e=0===c?a[0]??o.initialPageParam:g(o,l);if(c>0&&null==e)break;l=await p(l,e),c++}while(c<t)}return l};t.options.persister?t.fetchFn=()=>t.options.persister?.(u,{client:t.client,queryKey:t.queryKey,meta:t.options.meta,signal:t.signal},r):t.fetchFn=u}}}function g(e,{pages:t,pageParams:r}){let o=t.length-1;return t.length>0?e.getNextPageParam(t[o],t,r[o],r):void 0}var k=class{#s;#n;#a;#i;#l;#c;#u;#p;constructor(e={}){this.#s=e.queryCache||new p,this.#n=e.mutationCache||new m,this.#a=e.defaultOptions||{},this.#i=new Map,this.#l=new Map,this.#c=0}mount(){this.#c++,1===this.#c&&(this.#u=f.focusManager.subscribe(async e=>{e&&(await this.resumePausedMutations(),this.#s.onFocus())}),this.#p=w.onlineManager.subscribe(async e=>{e&&(await this.resumePausedMutations(),this.#s.onOnline())}))}unmount(){this.#c--,0===this.#c&&(this.#u?.(),this.#u=void 0,this.#p?.(),this.#p=void 0)}isFetching(e){return this.#s.findAll({...e,fetchStatus:"fetching"}).length}isMutating(e){return this.#n.findAll({...e,status:"pending"}).length}getQueryData(e){let t=this.defaultQueryOptions({queryKey:e});return this.#s.get(t.queryHash)?.state.data}ensureQueryData(e){let t=this.defaultQueryOptions(e),r=this.#s.build(this,t),o=r.state.data;return void 0===o?this.fetchQuery(e):(e.revalidateIfStale&&r.isStaleByTime((0,i.resolveStaleTime)(t.staleTime,r))&&this.prefetchQuery(t),Promise.resolve(o))}getQueriesData(e){return this.#s.findAll(e).map(({queryKey:e,state:t})=>[e,t.data])}setQueryData(e,t,r){let o=this.defaultQueryOptions({queryKey:e}),s=this.#s.get(o.queryHash),n=s?.state.data,a=(0,i.functionalUpdate)(t,n);if(void 0!==a)return this.#s.build(this,o).setData(a,{...r,manual:!0})}setQueriesData(e,t,r){return c.notifyManager.batch(()=>this.#s.findAll(e).map(({queryKey:e})=>[e,this.setQueryData(e,t,r)]))}getQueryState(e){let t=this.defaultQueryOptions({queryKey:e});return this.#s.get(t.queryHash)?.state}removeQueries(e){let t=this.#s;c.notifyManager.batch(()=>{t.findAll(e).forEach(e=>{t.remove(e)})})}resetQueries(e,t){let r=this.#s;return c.notifyManager.batch(()=>(r.findAll(e).forEach(e=>{e.reset()}),this.refetchQueries({type:"active",...e},t)))}cancelQueries(e,t={}){let r={revert:!0,...t};return Promise.all(c.notifyManager.batch(()=>this.#s.findAll(e).map(e=>e.cancel(r)))).then(i.noop).catch(i.noop)}invalidateQueries(e,t={}){return c.notifyManager.batch(()=>(this.#s.findAll(e).forEach(e=>{e.invalidate()}),e?.refetchType==="none")?Promise.resolve():this.refetchQueries({...e,type:e?.refetchType??e?.type??"active"},t))}refetchQueries(e,t={}){let r={...t,cancelRefetch:t.cancelRefetch??!0};return Promise.all(c.notifyManager.batch(()=>this.#s.findAll(e).filter(e=>!e.isDisabled()&&!e.isStatic()).map(e=>{let t=e.fetch(void 0,r);return r.throwOnError||(t=t.catch(i.noop)),"paused"===e.state.fetchStatus?Promise.resolve():t}))).then(i.noop)}fetchQuery(e){let t=this.defaultQueryOptions(e);void 0===t.retry&&(t.retry=!1);let r=this.#s.build(this,t);return r.isStaleByTime((0,i.resolveStaleTime)(t.staleTime,r))?r.fetch(t):Promise.resolve(r.state.data)}prefetchQuery(e){return this.fetchQuery(e).then(i.noop).catch(i.noop)}fetchInfiniteQuery(e){return e.behavior=b(e.pages),this.fetchQuery(e)}prefetchInfiniteQuery(e){return this.fetchInfiniteQuery(e).then(i.noop).catch(i.noop)}ensureInfiniteQueryData(e){return e.behavior=b(e.pages),this.ensureQueryData(e)}resumePausedMutations(){return w.onlineManager.isOnline()?this.#n.resumePausedMutations():Promise.resolve()}getQueryCache(){return this.#s}getMutationCache(){return this.#n}getDefaultOptions(){return this.#a}setDefaultOptions(e){this.#a=e}setQueryDefaults(e,t){this.#i.set((0,i.hashKey)(e),{queryKey:e,defaultOptions:t})}getQueryDefaults(e){let t=[...this.#i.values()],r={};return t.forEach(t=>{(0,i.partialMatchKey)(e,t.queryKey)&&Object.assign(r,t.defaultOptions)}),r}setMutationDefaults(e,t){this.#l.set((0,i.hashKey)(e),{mutationKey:e,defaultOptions:t})}getMutationDefaults(e){let t=[...this.#l.values()],r={};return t.forEach(t=>{(0,i.partialMatchKey)(e,t.mutationKey)&&Object.assign(r,t.defaultOptions)}),r}defaultQueryOptions(e){if(e._defaulted)return e;let t={...this.#a.queries,...this.getQueryDefaults(e.queryKey),...e,_defaulted:!0};return t.queryHash||(t.queryHash=(0,i.hashQueryKeyByOptions)(t.queryKey,t)),void 0===t.refetchOnReconnect&&(t.refetchOnReconnect="always"!==t.networkMode),void 0===t.throwOnError&&(t.throwOnError=!!t.suspense),!t.networkMode&&t.persister&&(t.networkMode="offlineFirst"),t.queryFn===i.skipToken&&(t.enabled=!1),t}defaultMutationOptions(e){return e?._defaulted?e:{...this.#a.mutations,...e?.mutationKey&&this.getMutationDefaults(e.mutationKey),...e,_defaulted:!0}}clear(){this.#s.clear(),this.#n.clear()}},v=e.i(760668);let x=(0,r.getDefaultConfig)({appName:"HolyMarket",projectId:"YOUR_PROJECT_ID",chains:[n.baseSepolia],ssr:!1}),C=new k;function W({children:e}){return(0,t.jsx)(s.WagmiProvider,{config:x,children:(0,t.jsx)(a.QueryClientProvider,{client:C,children:(0,t.jsx)(r.RainbowKitProvider,{theme:(0,o.darkTheme)({accentColor:"#0ea5e9",accentColorForeground:"white",borderRadius:"large",fontStack:"system",overlayBlur:"small"}),children:(0,t.jsx)(v.ToastProvider,{children:e})})})})}e.s(["Providers",()=>W],412679)},642290,e=>{e.v(t=>Promise.all(["static/chunks/bfe45fc1422c2363.js"].map(t=>e.l(t))).then(()=>t(54760)))},93724,e=>{e.v(e=>Promise.resolve().then(()=>e(442532)))},527529,e=>{e.v(t=>Promise.all(["static/chunks/d0fd263729f783c0.js","static/chunks/fbd3ca5c9861eb48.js","static/chunks/604a983cb4d61ed3.js"].map(t=>e.l(t))).then(()=>t(539513)))},109002,e=>{e.v(t=>Promise.all(["static/chunks/3a1233d8df5779d0.js","static/chunks/1fcb9029803d55c9.js","static/chunks/518a89606ce9ac2f.js"].map(t=>e.l(t))).then(()=>t(399375)))},402404,e=>{e.v(t=>Promise.all(["static/chunks/e1660c2f72f914ab.js"].map(t=>e.l(t))).then(()=>t(106195)))},16896,e=>{e.v(t=>Promise.all(["static/chunks/c3cd21fb390c6db6.js"].map(t=>e.l(t))).then(()=>t(124076)))},559409,e=>{e.v(t=>Promise.all(["static/chunks/853d3a8f154b40b5.js","static/chunks/f9393b2a864d2c03.js"].map(t=>e.l(t))).then(()=>t(513731)))},55610,e=>{e.v(t=>Promise.all(["static/chunks/fe07524cd1299c25.js"].map(t=>e.l(t))).then(()=>t(814927)))},53145,e=>{e.v(t=>Promise.all(["static/chunks/0914ed5d5771be7e.js"].map(t=>e.l(t))).then(()=>t(71475)))},215532,e=>{e.v(t=>Promise.all(["static/chunks/eee01d4009977ee5.js"].map(t=>e.l(t))).then(()=>t(929626)))},501402,e=>{e.v(t=>Promise.all(["static/chunks/9752cd852205866b.js"].map(t=>e.l(t))).then(()=>t(509417)))},130728,e=>{e.v(t=>Promise.all(["static/chunks/16d6e1953119daee.js"].map(t=>e.l(t))).then(()=>t(242730)))},134305,e=>{e.v(t=>Promise.all(["static/chunks/1741f69dd8975efe.js"].map(t=>e.l(t))).then(()=>t(618656)))},879253,e=>{e.v(t=>Promise.all(["static/chunks/11ebd6a868f5a2a7.js"].map(t=>e.l(t))).then(()=>t(661612)))},284655,e=>{e.v(t=>Promise.all(["static/chunks/ae94983a08d53eb6.js"].map(t=>e.l(t))).then(()=>t(11100)))},968578,e=>{e.v(t=>Promise.all(["static/chunks/ca4af64fe825a3bb.js"].map(t=>e.l(t))).then(()=>t(339785)))},580723,e=>{e.v(t=>Promise.all(["static/chunks/207864653ea9b95d.js"].map(t=>e.l(t))).then(()=>t(101550)))},490396,e=>{e.v(t=>Promise.all(["static/chunks/0ee45672ebcbe8e7.js"].map(t=>e.l(t))).then(()=>t(767643)))},986008,e=>{e.v(t=>Promise.all(["static/chunks/6a7e14c8e1e7c2bd.js"].map(t=>e.l(t))).then(()=>t(702626)))},67817,e=>{e.v(t=>Promise.all(["static/chunks/f7e0866316696968.js"].map(t=>e.l(t))).then(()=>t(632573)))},989495,e=>{e.v(t=>Promise.all(["static/chunks/ebf24bceb1b820f0.js"].map(t=>e.l(t))).then(()=>t(588709)))},460756,e=>{e.v(t=>Promise.all(["static/chunks/358ad3647fa63711.js"].map(t=>e.l(t))).then(()=>t(349327)))},641879,e=>{e.v(t=>Promise.all(["static/chunks/f77f69b5c7e50b3e.js"].map(t=>e.l(t))).then(()=>t(334363)))},107237,e=>{e.v(t=>Promise.all(["static/chunks/907ea055d7d4f4d6.js"].map(t=>e.l(t))).then(()=>t(843236)))},86674,e=>{e.v(t=>Promise.all(["static/chunks/13b063b4164f4c9d.js"].map(t=>e.l(t))).then(()=>t(938907)))},638395,e=>{e.v(t=>Promise.all(["static/chunks/a61ab2e0cc474885.js"].map(t=>e.l(t))).then(()=>t(175284)))},160077,e=>{e.v(t=>Promise.all(["static/chunks/336a47664b1e342f.js"].map(t=>e.l(t))).then(()=>t(574051)))},487100,e=>{e.v(t=>Promise.all(["static/chunks/b0ec205e00949a28.js"].map(t=>e.l(t))).then(()=>t(392273)))},723833,e=>{e.v(t=>Promise.all(["static/chunks/6b7b366ae54d49e5.js"].map(t=>e.l(t))).then(()=>t(950765)))},705976,e=>{e.v(t=>Promise.all(["static/chunks/c4a99a5ac43d845c.js"].map(t=>e.l(t))).then(()=>t(337034)))},886134,e=>{e.v(t=>Promise.all(["static/chunks/415255f26ca4b197.js"].map(t=>e.l(t))).then(()=>t(5475)))},825033,e=>{e.v(t=>Promise.all(["static/chunks/f8cfcf96a01b700d.js"].map(t=>e.l(t))).then(()=>t(945888)))},367791,e=>{e.v(t=>Promise.all(["static/chunks/13868bd707ddae41.js"].map(t=>e.l(t))).then(()=>t(693372)))},333474,e=>{e.v(t=>Promise.all(["static/chunks/1fc44ff15c6299f3.js"].map(t=>e.l(t))).then(()=>t(351110)))},571631,e=>{e.v(t=>Promise.all(["static/chunks/1a2298b74835317b.js"].map(t=>e.l(t))).then(()=>t(503594)))},585996,e=>{e.v(t=>Promise.all(["static/chunks/fa693cb0e2d4427d.js"].map(t=>e.l(t))).then(()=>t(728239)))},801621,e=>{e.v(t=>Promise.all(["static/chunks/66bb1005780431c4.js"].map(t=>e.l(t))).then(()=>t(38075)))},401192,e=>{e.v(t=>Promise.all(["static/chunks/6cbdfc2541fce167.js"].map(t=>e.l(t))).then(()=>t(529313)))},466334,e=>{e.v(t=>Promise.all(["static/chunks/f5595cd818c3683a.js"].map(t=>e.l(t))).then(()=>t(561596)))},834588,e=>{e.v(t=>Promise.all(["static/chunks/83482aaaf63a0e86.js"].map(t=>e.l(t))).then(()=>t(362275)))},618359,e=>{e.v(t=>Promise.all(["static/chunks/1ae5471f9bdc5541.js"].map(t=>e.l(t))).then(()=>t(809413)))},535047,e=>{e.v(t=>Promise.all(["static/chunks/7c10e4112841277e.js"].map(t=>e.l(t))).then(()=>t(773334)))},863490,e=>{e.v(t=>Promise.all(["static/chunks/758019aec65fc763.js"].map(t=>e.l(t))).then(()=>t(666206)))},157285,e=>{e.v(t=>Promise.all(["static/chunks/8610858cd4e2e418.js"].map(t=>e.l(t))).then(()=>t(248096)))},512383,e=>{e.v(t=>Promise.all(["static/chunks/8c268072c82c57c1.js"].map(t=>e.l(t))).then(()=>t(516657)))},390763,e=>{e.v(t=>Promise.all(["static/chunks/7e64a9279176f2a7.js"].map(t=>e.l(t))).then(()=>t(941576)))},95014,e=>{e.v(t=>Promise.all(["static/chunks/ecabbe5b6e680526.js"].map(t=>e.l(t))).then(()=>t(770422)))},562943,e=>{e.v(t=>Promise.all(["static/chunks/81397e7b03250e17.js"].map(t=>e.l(t))).then(()=>t(156048)))},94007,e=>{e.v(t=>Promise.all(["static/chunks/41cd04735b4bae8d.js"].map(t=>e.l(t))).then(()=>t(379996)))},853991,e=>{e.v(t=>Promise.all(["static/chunks/146b161e366b4e91.js"].map(t=>e.l(t))).then(()=>t(580431)))},675351,e=>{e.v(t=>Promise.all(["static/chunks/c8046cbedc5bf566.js"].map(t=>e.l(t))).then(()=>t(493106)))},231627,e=>{e.v(t=>Promise.all(["static/chunks/63d26c40a496a64a.js"].map(t=>e.l(t))).then(()=>t(806734)))},772904,e=>{e.v(t=>Promise.all(["static/chunks/d316825029d6b99a.js"].map(t=>e.l(t))).then(()=>t(356157)))},41575,e=>{e.v(t=>Promise.all(["static/chunks/81e820666b144f54.js"].map(t=>e.l(t))).then(()=>t(37686)))},803411,e=>{e.v(t=>Promise.all(["static/chunks/5b565bbcf798f36c.js"].map(t=>e.l(t))).then(()=>t(251111)))},367125,e=>{e.v(t=>Promise.all(["static/chunks/6705c121aa8b3731.js"].map(t=>e.l(t))).then(()=>t(166336)))},693550,e=>{e.v(t=>Promise.all(["static/chunks/6da23715ece1d725.js"].map(t=>e.l(t))).then(()=>t(669061)))},819549,e=>{e.v(t=>Promise.all(["static/chunks/17ddf8c84ac6270a.js"].map(t=>e.l(t))).then(()=>t(478910)))},580322,e=>{e.v(t=>Promise.all(["static/chunks/c4bc1494cc9e9a3d.js"].map(t=>e.l(t))).then(()=>t(787641)))},200527,e=>{e.v(t=>Promise.all(["static/chunks/e7ef54b094caa53c.js"].map(t=>e.l(t))).then(()=>t(179686)))},353227,e=>{e.v(t=>Promise.all(["static/chunks/73302a07f3a73afa.js"].map(t=>e.l(t))).then(()=>t(458195)))},863270,e=>{e.v(t=>Promise.all(["static/chunks/1e37ea99ffe83cc5.js"].map(t=>e.l(t))).then(()=>t(192328)))},406328,e=>{e.v(t=>Promise.all(["static/chunks/2dadddeefa27ba61.js"].map(t=>e.l(t))).then(()=>t(193099)))},831425,e=>{e.v(t=>Promise.all(["static/chunks/7f7e5002d9b9910a.js"].map(t=>e.l(t))).then(()=>t(863493)))},803928,e=>{e.v(t=>Promise.all(["static/chunks/6ee7c6a982acf7fc.js"].map(t=>e.l(t))).then(()=>t(812588)))},632161,e=>{e.v(t=>Promise.all(["static/chunks/1ccb62f0f60fcaea.js"].map(t=>e.l(t))).then(()=>t(113314)))},431406,e=>{e.v(t=>Promise.all(["static/chunks/f497fbc84fd141f7.js"].map(t=>e.l(t))).then(()=>t(306247)))},657657,e=>{e.v(t=>Promise.all(["static/chunks/5f6623fc94b43397.js"].map(t=>e.l(t))).then(()=>t(524883)))},688046,e=>{e.v(t=>Promise.all(["static/chunks/31ac2bf054a72675.js"].map(t=>e.l(t))).then(()=>t(624723)))},738745,e=>{e.v(t=>Promise.all(["static/chunks/91d7d69d76697527.js"].map(t=>e.l(t))).then(()=>t(850191)))},68128,e=>{e.v(t=>Promise.all(["static/chunks/97f9902cc8940ce5.js"].map(t=>e.l(t))).then(()=>t(592797)))},949355,e=>{e.v(t=>Promise.all(["static/chunks/ec9a9c5048bc25d8.js"].map(t=>e.l(t))).then(()=>t(290909)))},358551,e=>{e.v(t=>Promise.all(["static/chunks/8a23c145b820bbdb.js"].map(t=>e.l(t))).then(()=>t(619898)))},247225,e=>{e.v(t=>Promise.all(["static/chunks/c02a59e75dd2d2bf.js"].map(t=>e.l(t))).then(()=>t(618201)))},488488,e=>{e.v(t=>Promise.all(["static/chunks/f7c9cf67aa36ef4d.js"].map(t=>e.l(t))).then(()=>t(221469)))},780030,e=>{e.v(t=>Promise.all(["static/chunks/4f989cb7bc7833be.js"].map(t=>e.l(t))).then(()=>t(142335)))},303815,e=>{e.v(t=>Promise.all(["static/chunks/da546e9a81aadada.js"].map(t=>e.l(t))).then(()=>t(426604)))},588908,e=>{e.v(t=>Promise.all(["static/chunks/99bb80f16d853659.js"].map(t=>e.l(t))).then(()=>t(93196)))},42762,e=>{e.v(t=>Promise.all(["static/chunks/8d5181e0717997fb.js"].map(t=>e.l(t))).then(()=>t(728311)))},214789,e=>{e.v(t=>Promise.all(["static/chunks/a8acd263613e322d.js"].map(t=>e.l(t))).then(()=>t(797198)))},446879,e=>{e.v(t=>Promise.all(["static/chunks/bb9d57bd517f0a99.js"].map(t=>e.l(t))).then(()=>t(136818)))},982231,e=>{e.v(t=>Promise.all(["static/chunks/ffe42510c91701f0.js"].map(t=>e.l(t))).then(()=>t(480484)))}]);