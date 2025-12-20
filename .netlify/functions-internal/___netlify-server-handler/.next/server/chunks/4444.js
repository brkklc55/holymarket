"use strict";exports.id=4444,exports.ids=[4444],exports.modules={4444:(a,b,c)=>{c.r(b),c.d(b,{AppKitModal:()=>aQ,W3mListWallet:()=>aV,W3mModal:()=>aP,W3mModalBase:()=>aO,W3mRouterContainer:()=>aY,W3mUsageExceededView:()=>aS});var d=c(53478),e=c(75705),f=c(42353),g=c(5645),h=c(69869),i=c(23412),j=c(89608),k=c(50207),l=c(62970),m=c(89764),n=c(87336);let o={isUnsupportedChainView:()=>"UnsupportedChain"===l.I.state.view||"SwitchNetwork"===l.I.state.view&&l.I.state.history.includes("UnsupportedChain"),async safeClose(){this.isUnsupportedChainView()||await n.U.isSIWXCloseDisabled()?h.W.shake():(("DataCapture"===l.I.state.view||"DataCaptureOtpConfirm"===l.I.state.view)&&m.x.disconnect(),h.W.close())}};var p=c(67090),q=c(99257),r=c(66968),s=c(45149),t=c(35127),u=c(33198),v=c(84794),w=c(21925),x=c(44662),y=c(72742),z=c(63860),A=c(31386);let B={getGasPriceInEther:(a,b)=>Number(b*a)/1e18,getGasPriceInUSD(a,b,c){let d=B.getGasPriceInEther(b,c);return t.S.bigNumber(a).times(d).toNumber()},getPriceImpact({sourceTokenAmount:a,sourceTokenPriceInUSD:b,toTokenPriceInUSD:c,toTokenAmount:d}){let e=t.S.bigNumber(a).times(b),f=t.S.bigNumber(d).times(c);return e.minus(f).div(e).times(100).toNumber()},getMaxSlippage(a,b){let c=t.S.bigNumber(a).div(100);return t.S.multiply(b,c).toNumber()},getProviderFee:(a,b=.0085)=>t.S.bigNumber(a).times(b).toString(),isInsufficientNetworkTokenForGas:(a,b)=>!!t.S.bigNumber(a).eq(0)||t.S.bigNumber(t.S.bigNumber(b||"0")).gt(a),isInsufficientSourceTokenForSwap(a,b,c){let d=c?.find(a=>a.address===b)?.quantity?.numeric;return t.S.bigNumber(d||"0").lt(a)}};var C=c(90999),D=c(3229),E=c(22693),F=c(85126);let G={initializing:!1,initialized:!1,loadingPrices:!1,loadingQuote:!1,loadingApprovalTransaction:!1,loadingBuildTransaction:!1,loadingTransaction:!1,switchingTokens:!1,fetchError:!1,approvalTransaction:void 0,swapTransaction:void 0,transactionError:void 0,sourceToken:void 0,sourceTokenAmount:"",sourceTokenPriceInUSD:0,toToken:void 0,toTokenAmount:"",toTokenPriceInUSD:0,networkPrice:"0",networkBalanceInUSD:"0",networkTokenSymbol:"",inputError:void 0,slippage:y.oU.CONVERT_SLIPPAGE_TOLERANCE,tokens:void 0,popularTokens:void 0,suggestedTokens:void 0,foundTokens:void 0,myTokensWithBalance:void 0,tokensPriceMap:{},gasFee:"0",gasPriceInUSD:0,priceImpact:void 0,maxSlippage:void 0,providerFee:void 0},H=(0,r.BX)({...G}),I={state:H,subscribe:a=>(0,r.B1)(H,()=>a(H)),subscribeKey:(a,b)=>(0,s.u$)(H,a,b),getParams(){let a=i.W.state.activeChain,b=i.W.getAccountData(a)?.caipAddress??i.W.state.activeCaipAddress,c=z.w.getPlainAddress(b),d=(0,x.K1)(),e=j.a.getConnectorId(i.W.state.activeChain);if(!c)throw Error("No address found to swap the tokens from.");let f=!H.toToken?.address||!H.toToken?.decimals,g=!H.sourceToken?.address||!H.sourceToken?.decimals||!t.S.bigNumber(H.sourceTokenAmount).gt(0),h=!H.sourceTokenAmount;return{networkAddress:d,fromAddress:c,fromCaipAddress:b,sourceTokenAddress:H.sourceToken?.address,toTokenAddress:H.toToken?.address,toTokenAmount:H.toTokenAmount,toTokenDecimals:H.toToken?.decimals,sourceTokenAmount:H.sourceTokenAmount,sourceTokenDecimals:H.sourceToken?.decimals,invalidToToken:f,invalidSourceToken:g,invalidSourceTokenAmount:h,availableToSwap:b&&!f&&!g&&!h,isAuthConnector:e===u.o.CONNECTOR_ID.AUTH}},async setSourceToken(a){if(!a){H.sourceToken=a,H.sourceTokenAmount="",H.sourceTokenPriceInUSD=0;return}H.sourceToken=a,await J.setTokenPrice(a.address,"sourceToken")},setSourceTokenAmount(a){H.sourceTokenAmount=a},async setToToken(a){if(!a){H.toToken=a,H.toTokenAmount="",H.toTokenPriceInUSD=0;return}H.toToken=a,await J.setTokenPrice(a.address,"toToken")},setToTokenAmount(a){H.toTokenAmount=a?t.S.toFixed(a,6):""},async setTokenPrice(a,b){let c=H.tokensPriceMap[a]||0;c||(H.loadingPrices=!0,c=await J.getAddressPrice(a)),"sourceToken"===b?H.sourceTokenPriceInUSD=c:"toToken"===b&&(H.toTokenPriceInUSD=c),H.loadingPrices&&(H.loadingPrices=!1),J.getParams().availableToSwap&&!H.switchingTokens&&J.swapTokens()},async switchTokens(){if(!H.initializing&&H.initialized&&!H.switchingTokens){H.switchingTokens=!0;try{let a=H.toToken?{...H.toToken}:void 0,b=H.sourceToken?{...H.sourceToken}:void 0,c=a&&""===H.toTokenAmount?"1":H.toTokenAmount;J.setSourceTokenAmount(c),J.setToTokenAmount(""),await J.setSourceToken(a),await J.setToToken(b),H.switchingTokens=!1,J.swapTokens()}catch(a){throw H.switchingTokens=!1,a}}},resetState(){H.myTokensWithBalance=G.myTokensWithBalance,H.tokensPriceMap=G.tokensPriceMap,H.initialized=G.initialized,H.initializing=G.initializing,H.switchingTokens=G.switchingTokens,H.sourceToken=G.sourceToken,H.sourceTokenAmount=G.sourceTokenAmount,H.sourceTokenPriceInUSD=G.sourceTokenPriceInUSD,H.toToken=G.toToken,H.toTokenAmount=G.toTokenAmount,H.toTokenPriceInUSD=G.toTokenPriceInUSD,H.networkPrice=G.networkPrice,H.networkTokenSymbol=G.networkTokenSymbol,H.networkBalanceInUSD=G.networkBalanceInUSD,H.inputError=G.inputError},resetValues(){let{networkAddress:a}=J.getParams(),b=H.tokens?.find(b=>b.address===a);J.setSourceToken(b),J.setToToken(void 0)},getApprovalLoadingState:()=>H.loadingApprovalTransaction,clearError(){H.transactionError=void 0},async initializeState(){if(!H.initializing){if(H.initializing=!0,!H.initialized)try{await J.fetchTokens(),H.initialized=!0}catch(a){H.initialized=!1,q.P.showError("Failed to initialize swap"),l.I.goBack()}H.initializing=!1}},async fetchTokens(){let{networkAddress:a}=J.getParams();await J.getNetworkTokenPrice(),await J.getMyTokensWithBalance();let b=H.myTokensWithBalance?.find(b=>b.address===a);b&&(H.networkTokenSymbol=b.symbol,J.setSourceToken(b),J.setSourceTokenAmount("0"))},async getTokenList(){let a=i.W.state.activeCaipNetwork?.caipNetworkId;if(H.caipNetworkId!==a||!H.tokens)try{H.tokensLoading=!0;let b=await A.s.getTokenList(a);H.tokens=b,H.caipNetworkId=a,H.popularTokens=b.sort((a,b)=>a.symbol<b.symbol?-1:+(a.symbol>b.symbol));let c=(a&&y.oU.SUGGESTED_TOKENS_BY_CHAIN?.[a]||[]).map(a=>b.find(b=>b.symbol===a)).filter(a=>!!a),d=(y.oU.SWAP_SUGGESTED_TOKENS||[]).map(a=>b.find(b=>b.symbol===a)).filter(a=>!!a).filter(a=>!c.some(b=>b.address===a.address));H.suggestedTokens=[...c,...d]}catch(a){H.tokens=[],H.popularTokens=[],H.suggestedTokens=[]}finally{H.tokensLoading=!1}},async getAddressPrice(a){let b=H.tokensPriceMap[a];if(b)return b;let c=await E.T.fetchTokenPrice({addresses:[a]}),d=c?.fungibles||[],e=[...H.tokens||[],...H.myTokensWithBalance||[]],f=e?.find(b=>b.address===a)?.symbol,g=parseFloat((d.find(a=>a.symbol.toLowerCase()===f?.toLowerCase())?.price||0).toString());return H.tokensPriceMap[a]=g,g},async getNetworkTokenPrice(){let{networkAddress:a}=J.getParams(),b=await E.T.fetchTokenPrice({addresses:[a]}).catch(()=>(q.P.showError("Failed to fetch network token price"),{fungibles:[]})),c=b.fungibles?.[0],d=c?.price.toString()||"0";H.tokensPriceMap[a]=parseFloat(d),H.networkTokenSymbol=c?.symbol||"",H.networkPrice=d},async getMyTokensWithBalance(a){let b=await w.Z.getMyTokensWithBalance(a),c=A.s.mapBalancesToSwapTokens(b);c&&(await J.getInitialGasPrice(),J.setBalances(c))},setBalances(a){let{networkAddress:b}=J.getParams(),c=i.W.state.activeCaipNetwork;if(!c)return;let d=a.find(a=>a.address===b);a.forEach(a=>{H.tokensPriceMap[a.address]=a.price||0}),H.myTokensWithBalance=a.filter(a=>a.address.startsWith(c.caipNetworkId)),H.networkBalanceInUSD=d?t.S.multiply(d.quantity.numeric,d.price).toString():"0"},async getInitialGasPrice(){let a=await A.s.fetchGasPrice();if(!a)return{gasPrice:null,gasPriceInUSD:null};switch(i.W.state?.activeCaipNetwork?.chainNamespace){case u.o.CHAIN.SOLANA:return H.gasFee=a.standard??"0",H.gasPriceInUSD=t.S.multiply(a.standard,H.networkPrice).div(1e9).toNumber(),{gasPrice:BigInt(H.gasFee),gasPriceInUSD:Number(H.gasPriceInUSD)};case u.o.CHAIN.EVM:default:let b=a.standard??"0",c=BigInt(b),d=BigInt(15e4),e=B.getGasPriceInUSD(H.networkPrice,d,c);return H.gasFee=b,H.gasPriceInUSD=e,{gasPrice:c,gasPriceInUSD:e}}},async swapTokens(){let a=i.W.getAccountData()?.address,b=H.sourceToken,c=H.toToken,d=t.S.bigNumber(H.sourceTokenAmount).gt(0);if(d||J.setToTokenAmount(""),!c||!b||H.loadingPrices||!d||!a)return;H.loadingQuote=!0;let e=t.S.bigNumber(H.sourceTokenAmount).times(10**b.decimals).round(0);try{let d=await E.T.fetchSwapQuote({userAddress:a,from:b.address,to:c.address,gasPrice:H.gasFee,amount:e.toString()});H.loadingQuote=!1;let f=d?.quotes?.[0]?.toAmount;if(!f)return void D.h.open({displayMessage:"Incorrect amount",debugMessage:"Please enter a valid amount"},"error");let g=t.S.bigNumber(f).div(10**c.decimals).toString();J.setToTokenAmount(g),J.hasInsufficientToken(H.sourceTokenAmount,b.address)?H.inputError="Insufficient balance":(H.inputError=void 0,J.setTransactionDetails())}catch(b){let a=await A.s.handleSwapError(b);H.loadingQuote=!1,H.inputError=a||"Insufficient balance"}},async getTransaction(){let{fromCaipAddress:a,availableToSwap:b}=J.getParams(),c=H.sourceToken,d=H.toToken;if(a&&b&&c&&d&&!H.loadingQuote)try{let b;return H.loadingBuildTransaction=!0,b=await A.s.fetchSwapAllowance({userAddress:a,tokenAddress:c.address,sourceTokenAmount:H.sourceTokenAmount,sourceTokenDecimals:c.decimals})?await J.createSwapTransaction():await J.createAllowanceTransaction(),H.loadingBuildTransaction=!1,H.fetchError=!1,b}catch(a){l.I.goBack(),q.P.showError("Failed to check allowance"),H.loadingBuildTransaction=!1,H.approvalTransaction=void 0,H.swapTransaction=void 0,H.fetchError=!0;return}},async createAllowanceTransaction(){let{fromCaipAddress:a,sourceTokenAddress:b,toTokenAddress:c}=J.getParams();if(a&&c){if(!b)throw Error("createAllowanceTransaction - No source token address found.");try{let d=await E.T.generateApproveCalldata({from:b,to:c,userAddress:a}),e=z.w.getPlainAddress(d.tx.from);if(!e)throw Error("SwapController:createAllowanceTransaction - address is required");let f={data:d.tx.data,to:e,gasPrice:BigInt(d.tx.eip155.gasPrice),value:BigInt(d.tx.value),toAmount:H.toTokenAmount};return H.swapTransaction=void 0,H.approvalTransaction={data:f.data,to:f.to,gasPrice:f.gasPrice,value:f.value,toAmount:f.toAmount},{data:f.data,to:f.to,gasPrice:f.gasPrice,value:f.value,toAmount:f.toAmount}}catch(a){l.I.goBack(),q.P.showError("Failed to create approval transaction"),H.approvalTransaction=void 0,H.swapTransaction=void 0,H.fetchError=!0;return}}},async createSwapTransaction(){let{networkAddress:a,fromCaipAddress:b,sourceTokenAmount:c}=J.getParams(),d=H.sourceToken,e=H.toToken;if(!b||!c||!d||!e)return;let f=m.x.parseUnits(c,d.decimals)?.toString();try{let c=await E.T.generateSwapCalldata({userAddress:b,from:d.address,to:e.address,amount:f,disableEstimate:!0}),g=d.address===a,h=BigInt(c.tx.eip155.gas),i=BigInt(c.tx.eip155.gasPrice),j=z.w.getPlainAddress(c.tx.to);if(!j)throw Error("SwapController:createSwapTransaction - address is required");let k={data:c.tx.data,to:j,gas:h,gasPrice:i,value:g?BigInt(f??"0"):BigInt("0"),toAmount:H.toTokenAmount};return H.gasPriceInUSD=B.getGasPriceInUSD(H.networkPrice,h,i),H.approvalTransaction=void 0,H.swapTransaction=k,k}catch(a){l.I.goBack(),q.P.showError("Failed to create transaction"),H.approvalTransaction=void 0,H.swapTransaction=void 0,H.fetchError=!0;return}},onEmbeddedWalletApprovalSuccess(){q.P.showLoading("Approve limit increase in your wallet"),l.I.replace("SwapPreview")},async sendTransactionForApproval(a){let{fromAddress:b,isAuthConnector:c}=J.getParams();H.loadingApprovalTransaction=!0,c?l.I.pushTransactionStack({onSuccess:J.onEmbeddedWalletApprovalSuccess}):q.P.showLoading("Approve limit increase in your wallet");try{await m.x.sendTransaction({address:b,to:a.to,data:a.data,value:a.value,chainNamespace:u.o.CHAIN.EVM}),await J.swapTokens(),await J.getTransaction(),H.approvalTransaction=void 0,H.loadingApprovalTransaction=!1}catch(a){H.transactionError=a?.displayMessage,H.loadingApprovalTransaction=!1,q.P.showError(a?.displayMessage||"Transaction error"),F.E.sendEvent({type:"track",event:"SWAP_APPROVAL_ERROR",properties:{message:a?.displayMessage||a?.message||"Unknown",network:i.W.state.activeCaipNetwork?.caipNetworkId||"",swapFromToken:J.state.sourceToken?.symbol||"",swapToToken:J.state.toToken?.symbol||"",swapFromAmount:J.state.sourceTokenAmount||"",swapToAmount:J.state.toTokenAmount||"",isSmartAccount:(0,x.lj)(u.o.CHAIN.EVM)===v.Vl.ACCOUNT_TYPES.SMART_ACCOUNT}})}},async sendTransactionForSwap(a){if(!a)return;let{fromAddress:b,toTokenAmount:c,isAuthConnector:d}=J.getParams();H.loadingTransaction=!0;let e=`Swapping ${H.sourceToken?.symbol} to ${t.S.formatNumberToLocalString(c,3)} ${H.toToken?.symbol}`,f=`Swapped ${H.sourceToken?.symbol} to ${t.S.formatNumberToLocalString(c,3)} ${H.toToken?.symbol}`;d?l.I.pushTransactionStack({onSuccess(){l.I.replace("Account"),q.P.showLoading(e),I.resetState()}}):q.P.showLoading("Confirm transaction in your wallet");try{let c=[H.sourceToken?.address,H.toToken?.address].join(","),e=await m.x.sendTransaction({address:b,to:a.to,data:a.data,value:a.value,chainNamespace:u.o.CHAIN.EVM});return H.loadingTransaction=!1,q.P.showSuccess(f),F.E.sendEvent({type:"track",event:"SWAP_SUCCESS",properties:{network:i.W.state.activeCaipNetwork?.caipNetworkId||"",swapFromToken:J.state.sourceToken?.symbol||"",swapToToken:J.state.toToken?.symbol||"",swapFromAmount:J.state.sourceTokenAmount||"",swapToAmount:J.state.toTokenAmount||"",isSmartAccount:(0,x.lj)(u.o.CHAIN.EVM)===v.Vl.ACCOUNT_TYPES.SMART_ACCOUNT}}),I.resetState(),d||l.I.replace("Account"),I.getMyTokensWithBalance(c),e}catch(a){H.transactionError=a?.displayMessage,H.loadingTransaction=!1,q.P.showError(a?.displayMessage||"Transaction error"),F.E.sendEvent({type:"track",event:"SWAP_ERROR",properties:{message:a?.displayMessage||a?.message||"Unknown",network:i.W.state.activeCaipNetwork?.caipNetworkId||"",swapFromToken:J.state.sourceToken?.symbol||"",swapToToken:J.state.toToken?.symbol||"",swapFromAmount:J.state.sourceTokenAmount||"",swapToAmount:J.state.toTokenAmount||"",isSmartAccount:(0,x.lj)(u.o.CHAIN.EVM)===v.Vl.ACCOUNT_TYPES.SMART_ACCOUNT}});return}},hasInsufficientToken:(a,b)=>B.isInsufficientSourceTokenForSwap(a,b,H.myTokensWithBalance),setTransactionDetails(){let{toTokenAddress:a,toTokenDecimals:b}=J.getParams();a&&b&&(H.gasPriceInUSD=B.getGasPriceInUSD(H.networkPrice,BigInt(H.gasFee),BigInt(15e4)),H.priceImpact=B.getPriceImpact({sourceTokenAmount:H.sourceTokenAmount,sourceTokenPriceInUSD:H.sourceTokenPriceInUSD,toTokenPriceInUSD:H.toTokenPriceInUSD,toTokenAmount:H.toTokenAmount}),H.maxSlippage=B.getMaxSlippage(H.slippage,H.toTokenAmount),H.providerFee=B.getProviderFee(H.sourceTokenAmount))}},J=(0,C.X)(I);var K=c(18448),L=c(58003),M=c(33440),N=c(38051);let O=(0,N.AH)`
  :host {
    display: block;
    border-radius: clamp(0px, ${({borderRadius:a})=>a["8"]}, 44px);
    box-shadow: 0 0 0 1px ${({tokens:a})=>a.theme.foregroundPrimary};
    overflow: hidden;
  }
`,P=class extends d.WF{render(){return(0,d.qy)`<slot></slot>`}};P.styles=[L.W5,O],P=function(a,b,c,d){var e,f=arguments.length,g=f<3?b:null===d?d=Object.getOwnPropertyDescriptor(b,c):d;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)g=Reflect.decorate(a,b,c,d);else for(var h=a.length-1;h>=0;h--)(e=a[h])&&(g=(f<3?e(g):f>3?e(b,c,g):e(b,c))||g);return f>3&&g&&Object.defineProperty(b,c,g),g}([(0,M.E)("wui-card")],P),c(64436),c(49263),c(61389),c(41074);let Q=(0,N.AH)`
  :host {
    width: 100%;
  }

  :host > wui-flex {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: ${({spacing:a})=>a[2]};
    padding: ${({spacing:a})=>a[3]};
    border-radius: ${({borderRadius:a})=>a[6]};
    border: 1px solid ${({tokens:a})=>a.theme.borderPrimary};
    box-sizing: border-box;
    background-color: ${({tokens:a})=>a.theme.foregroundPrimary};
    box-shadow: 0px 0px 16px 0px rgba(0, 0, 0, 0.25);
    color: ${({tokens:a})=>a.theme.textPrimary};
  }

  :host > wui-flex[data-type='info'] {
    .icon-box {
      background-color: ${({tokens:a})=>a.theme.foregroundSecondary};

      wui-icon {
        color: ${({tokens:a})=>a.theme.iconDefault};
      }
    }
  }
  :host > wui-flex[data-type='success'] {
    .icon-box {
      background-color: ${({tokens:a})=>a.core.backgroundSuccess};

      wui-icon {
        color: ${({tokens:a})=>a.core.borderSuccess};
      }
    }
  }
  :host > wui-flex[data-type='warning'] {
    .icon-box {
      background-color: ${({tokens:a})=>a.core.backgroundWarning};

      wui-icon {
        color: ${({tokens:a})=>a.core.borderWarning};
      }
    }
  }
  :host > wui-flex[data-type='error'] {
    .icon-box {
      background-color: ${({tokens:a})=>a.core.backgroundError};

      wui-icon {
        color: ${({tokens:a})=>a.core.borderError};
      }
    }
  }

  wui-flex {
    width: 100%;
  }

  wui-text {
    word-break: break-word;
    flex: 1;
  }

  .close {
    cursor: pointer;
    color: ${({tokens:a})=>a.theme.iconDefault};
  }

  .icon-box {
    height: 40px;
    width: 40px;
    border-radius: ${({borderRadius:a})=>a["2"]};
    background-color: var(--local-icon-bg-value);
  }
`;var R=function(a,b,c,d){var e,f=arguments.length,g=f<3?b:null===d?d=Object.getOwnPropertyDescriptor(b,c):d;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)g=Reflect.decorate(a,b,c,d);else for(var h=a.length-1;h>=0;h--)(e=a[h])&&(g=(f<3?e(g):f>3?e(b,c,g):e(b,c))||g);return f>3&&g&&Object.defineProperty(b,c,g),g};let S={info:"info",success:"checkmark",warning:"warningCircle",error:"warning"},T=class extends d.WF{constructor(){super(...arguments),this.message="",this.type="info"}render(){return(0,d.qy)`
      <wui-flex
        data-type=${(0,f.J)(this.type)}
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        gap="2"
      >
        <wui-flex columnGap="2" flexDirection="row" alignItems="center">
          <wui-flex
            flexDirection="row"
            alignItems="center"
            justifyContent="center"
            class="icon-box"
          >
            <wui-icon color="inherit" size="md" name=${S[this.type]}></wui-icon>
          </wui-flex>
          <wui-text variant="md-medium" color="inherit" data-testid="wui-alertbar-text"
            >${this.message}</wui-text
          >
        </wui-flex>
        <wui-icon
          class="close"
          color="inherit"
          size="sm"
          name="close"
          @click=${this.onClose}
        ></wui-icon>
      </wui-flex>
    `}onClose(){D.h.close()}};T.styles=[L.W5,Q],R([(0,e.MZ)()],T.prototype,"message",void 0),R([(0,e.MZ)()],T.prototype,"type",void 0),T=R([(0,M.E)("wui-alertbar")],T);let U=(0,K.AH)`
  :host {
    display: block;
    position: absolute;
    top: ${({spacing:a})=>a["3"]};
    left: ${({spacing:a})=>a["4"]};
    right: ${({spacing:a})=>a["4"]};
    opacity: 0;
    pointer-events: none;
  }
`;var V=function(a,b,c,d){var e,f=arguments.length,g=f<3?b:null===d?d=Object.getOwnPropertyDescriptor(b,c):d;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)g=Reflect.decorate(a,b,c,d);else for(var h=a.length-1;h>=0;h--)(e=a[h])&&(g=(f<3?e(g):f>3?e(b,c,g):e(b,c))||g);return f>3&&g&&Object.defineProperty(b,c,g),g};let W={info:{backgroundColor:"fg-350",iconColor:"fg-325",icon:"info"},success:{backgroundColor:"success-glass-reown-020",iconColor:"success-125",icon:"checkmark"},warning:{backgroundColor:"warning-glass-reown-020",iconColor:"warning-100",icon:"warningCircle"},error:{backgroundColor:"error-glass-reown-020",iconColor:"error-125",icon:"warning"}},X=class extends d.WF{constructor(){super(),this.unsubscribe=[],this.open=D.h.state.open,this.onOpen(!0),this.unsubscribe.push(D.h.subscribeKey("open",a=>{this.open=a,this.onOpen(!1)}))}disconnectedCallback(){this.unsubscribe.forEach(a=>a())}render(){let{message:a,variant:b}=D.h.state,c=W[b];return(0,d.qy)`
      <wui-alertbar
        message=${a}
        backgroundColor=${c?.backgroundColor}
        iconColor=${c?.iconColor}
        icon=${c?.icon}
        type=${b}
      ></wui-alertbar>
    `}onOpen(a){this.open?(this.animate([{opacity:0,transform:"scale(0.85)"},{opacity:1,transform:"scale(1)"}],{duration:150,fill:"forwards",easing:"ease"}),this.style.cssText="pointer-events: auto"):a||(this.animate([{opacity:1,transform:"scale(1)"},{opacity:0,transform:"scale(0.85)"}],{duration:150,fill:"forwards",easing:"ease"}),this.style.cssText="pointer-events: none")}};X.styles=U,V([(0,e.wk)()],X.prototype,"open",void 0),X=V([(0,K.EM)("w3m-alertbar")],X);var Y=c(78743),Z=c(58319);let $=(0,N.AH)`
  :host {
    position: relative;
  }

  button {
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: transparent;
    padding: ${({spacing:a})=>a[1]};
  }

  /* -- Colors --------------------------------------------------- */
  button[data-type='accent'] wui-icon {
    color: ${({tokens:a})=>a.core.iconAccentPrimary};
  }

  button[data-type='neutral'][data-variant='primary'] wui-icon {
    color: ${({tokens:a})=>a.theme.iconInverse};
  }

  button[data-type='neutral'][data-variant='secondary'] wui-icon {
    color: ${({tokens:a})=>a.theme.iconDefault};
  }

  button[data-type='success'] wui-icon {
    color: ${({tokens:a})=>a.core.iconSuccess};
  }

  button[data-type='error'] wui-icon {
    color: ${({tokens:a})=>a.core.iconError};
  }

  /* -- Sizes --------------------------------------------------- */
  button[data-size='xs'] {
    width: 16px;
    height: 16px;

    border-radius: ${({borderRadius:a})=>a[1]};
  }

  button[data-size='sm'] {
    width: 20px;
    height: 20px;
    border-radius: ${({borderRadius:a})=>a[1]};
  }

  button[data-size='md'] {
    width: 24px;
    height: 24px;
    border-radius: ${({borderRadius:a})=>a[2]};
  }

  button[data-size='lg'] {
    width: 28px;
    height: 28px;
    border-radius: ${({borderRadius:a})=>a[2]};
  }

  button[data-size='xs'] wui-icon {
    width: 8px;
    height: 8px;
  }

  button[data-size='sm'] wui-icon {
    width: 12px;
    height: 12px;
  }

  button[data-size='md'] wui-icon {
    width: 16px;
    height: 16px;
  }

  button[data-size='lg'] wui-icon {
    width: 20px;
    height: 20px;
  }

  /* -- Hover --------------------------------------------------- */
  @media (hover: hover) {
    button[data-type='accent']:hover:enabled {
      background-color: ${({tokens:a})=>a.core.foregroundAccent010};
    }

    button[data-variant='primary'][data-type='neutral']:hover:enabled {
      background-color: ${({tokens:a})=>a.theme.foregroundSecondary};
    }

    button[data-variant='secondary'][data-type='neutral']:hover:enabled {
      background-color: ${({tokens:a})=>a.theme.foregroundSecondary};
    }

    button[data-type='success']:hover:enabled {
      background-color: ${({tokens:a})=>a.core.backgroundSuccess};
    }

    button[data-type='error']:hover:enabled {
      background-color: ${({tokens:a})=>a.core.backgroundError};
    }
  }

  /* -- Focus --------------------------------------------------- */
  button:focus-visible {
    box-shadow: 0 0 0 4px ${({tokens:a})=>a.core.foregroundAccent020};
  }

  /* -- Properties --------------------------------------------------- */
  button[data-full-width='true'] {
    width: 100%;
  }

  :host([fullWidth]) {
    width: 100%;
  }

  button[disabled] {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;var _=function(a,b,c,d){var e,f=arguments.length,g=f<3?b:null===d?d=Object.getOwnPropertyDescriptor(b,c):d;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)g=Reflect.decorate(a,b,c,d);else for(var h=a.length-1;h>=0;h--)(e=a[h])&&(g=(f<3?e(g):f>3?e(b,c,g):e(b,c))||g);return f>3&&g&&Object.defineProperty(b,c,g),g};let aa=class extends d.WF{constructor(){super(...arguments),this.icon="card",this.variant="primary",this.type="accent",this.size="md",this.iconSize=void 0,this.fullWidth=!1,this.disabled=!1}render(){return(0,d.qy)`<button
      data-variant=${this.variant}
      data-type=${this.type}
      data-size=${this.size}
      data-full-width=${this.fullWidth}
      ?disabled=${this.disabled}
    >
      <wui-icon color="inherit" name=${this.icon} size=${(0,f.J)(this.iconSize)}></wui-icon>
    </button>`}};aa.styles=[L.W5,L.fD,$],_([(0,e.MZ)()],aa.prototype,"icon",void 0),_([(0,e.MZ)()],aa.prototype,"variant",void 0),_([(0,e.MZ)()],aa.prototype,"type",void 0),_([(0,e.MZ)()],aa.prototype,"size",void 0),_([(0,e.MZ)()],aa.prototype,"iconSize",void 0),_([(0,e.MZ)({type:Boolean})],aa.prototype,"fullWidth",void 0),_([(0,e.MZ)({type:Boolean})],aa.prototype,"disabled",void 0),aa=_([(0,M.E)("wui-icon-button")],aa),c(87922);let ab=(0,N.AH)`
  button {
    display: block;
    display: flex;
    align-items: center;
    padding: ${({spacing:a})=>a[1]};
    transition: background-color ${({durations:a})=>a.lg}
      ${({easings:a})=>a["ease-out-power-2"]};
    will-change: background-color;
    border-radius: ${({borderRadius:a})=>a[32]};
  }

  wui-image {
    border-radius: 100%;
  }

  wui-text {
    padding-left: ${({spacing:a})=>a[1]};
  }

  .left-icon-container,
  .right-icon-container {
    width: 24px;
    height: 24px;
    justify-content: center;
    align-items: center;
  }

  wui-icon {
    color: ${({tokens:a})=>a.theme.iconDefault};
  }

  /* -- Sizes --------------------------------------------------- */
  button[data-size='lg'] {
    height: 32px;
  }

  button[data-size='md'] {
    height: 28px;
  }

  button[data-size='sm'] {
    height: 24px;
  }

  button[data-size='lg'] wui-image {
    width: 24px;
    height: 24px;
  }

  button[data-size='md'] wui-image {
    width: 20px;
    height: 20px;
  }

  button[data-size='sm'] wui-image {
    width: 16px;
    height: 16px;
  }

  button[data-size='lg'] .left-icon-container {
    width: 24px;
    height: 24px;
  }

  button[data-size='md'] .left-icon-container {
    width: 20px;
    height: 20px;
  }

  button[data-size='sm'] .left-icon-container {
    width: 16px;
    height: 16px;
  }

  /* -- Variants --------------------------------------------------------- */
  button[data-type='filled-dropdown'] {
    background-color: ${({tokens:a})=>a.theme.foregroundPrimary};
  }

  button[data-type='text-dropdown'] {
    background-color: transparent;
  }

  /* -- Focus states --------------------------------------------------- */
  button:focus-visible:enabled {
    background-color: ${({tokens:a})=>a.theme.foregroundSecondary};
    box-shadow: 0 0 0 4px ${({tokens:a})=>a.core.foregroundAccent040};
  }

  /* -- Hover & Active states ----------------------------------------------------------- */
  @media (hover: hover) and (pointer: fine) {
    button:hover:enabled,
    button:active:enabled {
      background-color: ${({tokens:a})=>a.theme.foregroundSecondary};
    }
  }

  /* -- Disabled states --------------------------------------------------- */
  button:disabled {
    background-color: ${({tokens:a})=>a.theme.foregroundSecondary};
    opacity: 0.5;
  }
`;var ac=function(a,b,c,d){var e,f=arguments.length,g=f<3?b:null===d?d=Object.getOwnPropertyDescriptor(b,c):d;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)g=Reflect.decorate(a,b,c,d);else for(var h=a.length-1;h>=0;h--)(e=a[h])&&(g=(f<3?e(g):f>3?e(b,c,g):e(b,c))||g);return f>3&&g&&Object.defineProperty(b,c,g),g};let ad={lg:"lg-regular",md:"md-regular",sm:"sm-regular"},ae={lg:"lg",md:"md",sm:"sm"},af=class extends d.WF{constructor(){super(...arguments),this.imageSrc="",this.text="",this.size="lg",this.type="text-dropdown",this.disabled=!1}render(){return(0,d.qy)`<button ?disabled=${this.disabled} data-size=${this.size} data-type=${this.type}>
      ${this.imageTemplate()} ${this.textTemplate()}
      <wui-flex class="right-icon-container">
        <wui-icon name="chevronBottom"></wui-icon>
      </wui-flex>
    </button>`}textTemplate(){let a=ad[this.size];return this.text?(0,d.qy)`<wui-text color="primary" variant=${a}>${this.text}</wui-text>`:null}imageTemplate(){if(this.imageSrc)return(0,d.qy)`<wui-image src=${this.imageSrc} alt="select visual"></wui-image>`;let a=ae[this.size];return(0,d.qy)` <wui-flex class="left-icon-container">
      <wui-icon size=${a} name="networkPlaceholder"></wui-icon>
    </wui-flex>`}};af.styles=[L.W5,L.fD,ab],ac([(0,e.MZ)()],af.prototype,"imageSrc",void 0),ac([(0,e.MZ)()],af.prototype,"text",void 0),ac([(0,e.MZ)()],af.prototype,"size",void 0),ac([(0,e.MZ)()],af.prototype,"type",void 0),ac([(0,e.MZ)({type:Boolean})],af.prototype,"disabled",void 0),af=ac([(0,M.E)("wui-select")],af),c(97833),c(82268);var ag=c(67436);let ah=(0,K.AH)`
  :host {
    height: 60px;
  }

  :host > wui-flex {
    box-sizing: border-box;
    background-color: var(--local-header-background-color);
  }

  wui-text {
    background-color: var(--local-header-background-color);
  }

  wui-flex.w3m-header-title {
    transform: translateY(0);
    opacity: 1;
  }

  wui-flex.w3m-header-title[view-direction='prev'] {
    animation:
      slide-down-out 120ms forwards ${({easings:a})=>a["ease-out-power-2"]},
      slide-down-in 120ms forwards ${({easings:a})=>a["ease-out-power-2"]};
    animation-delay: 0ms, 200ms;
  }

  wui-flex.w3m-header-title[view-direction='next'] {
    animation:
      slide-up-out 120ms forwards ${({easings:a})=>a["ease-out-power-2"]},
      slide-up-in 120ms forwards ${({easings:a})=>a["ease-out-power-2"]};
    animation-delay: 0ms, 200ms;
  }

  wui-icon-button[data-hidden='true'] {
    opacity: 0 !important;
    pointer-events: none;
  }

  @keyframes slide-up-out {
    from {
      transform: translateY(0px);
      opacity: 1;
    }
    to {
      transform: translateY(3px);
      opacity: 0;
    }
  }

  @keyframes slide-up-in {
    from {
      transform: translateY(-3px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @keyframes slide-down-out {
    from {
      transform: translateY(0px);
      opacity: 1;
    }
    to {
      transform: translateY(-3px);
      opacity: 0;
    }
  }

  @keyframes slide-down-in {
    from {
      transform: translateY(3px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`;var ai=function(a,b,c,d){var e,f=arguments.length,g=f<3?b:null===d?d=Object.getOwnPropertyDescriptor(b,c):d;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)g=Reflect.decorate(a,b,c,d);else for(var h=a.length-1;h>=0;h--)(e=a[h])&&(g=(f<3?e(g):f>3?e(b,c,g):e(b,c))||g);return f>3&&g&&Object.defineProperty(b,c,g),g};let aj=["SmartSessionList"],ak={PayWithExchange:K.f.tokens.theme.foregroundPrimary};function al(){let a=l.I.state.data?.connector?.name,b=l.I.state.data?.wallet?.name,c=l.I.state.data?.network?.name,d=b??a,e=j.a.getConnectors(),f=1===e.length&&e[0]?.id==="w3m-email",g=i.W.getAccountData()?.socialProvider;return{Connect:`Connect ${f?"Email":""} Wallet`,Create:"Create Wallet",ChooseAccountName:void 0,Account:void 0,AccountSettings:void 0,AllWallets:"All Wallets",ApproveTransaction:"Approve Transaction",BuyInProgress:"Buy",UsageExceeded:"Usage Exceeded",ConnectingExternal:d??"Connect Wallet",ConnectingWalletConnect:d??"WalletConnect",ConnectingWalletConnectBasic:"WalletConnect",ConnectingSiwe:"Sign In",Convert:"Convert",ConvertSelectToken:"Select token",ConvertPreview:"Preview Convert",Downloads:d?`Get ${d}`:"Downloads",EmailLogin:"Email Login",EmailVerifyOtp:"Confirm Email",EmailVerifyDevice:"Register Device",GetWallet:"Get a Wallet",Networks:"Choose Network",OnRampProviders:"Choose Provider",OnRampActivity:"Activity",OnRampTokenSelect:"Select Token",OnRampFiatSelect:"Select Currency",Pay:"How you pay",ProfileWallets:"Wallets",SwitchNetwork:c??"Switch Network",Transactions:"Activity",UnsupportedChain:"Switch Network",UpgradeEmailWallet:"Upgrade Your Wallet",UpdateEmailWallet:"Edit Email",UpdateEmailPrimaryOtp:"Confirm Current Email",UpdateEmailSecondaryOtp:"Confirm New Email",WhatIsABuy:"What is Buy?",RegisterAccountName:"Choose Name",RegisterAccountNameSuccess:"",WalletReceive:"Receive",WalletCompatibleNetworks:"Compatible Networks",Swap:"Swap",SwapSelectToken:"Select Token",SwapPreview:"Preview Swap",WalletSend:"Send",WalletSendPreview:"Review Send",WalletSendSelectToken:"Select Token",WalletSendConfirmed:"Confirmed",WhatIsANetwork:"What is a network?",WhatIsAWallet:"What is a Wallet?",ConnectWallets:"Connect Wallet",ConnectSocials:"All Socials",ConnectingSocial:g?g.charAt(0).toUpperCase()+g.slice(1):"Connect Social",ConnectingMultiChain:"Select Chain",ConnectingFarcaster:"Farcaster",SwitchActiveChain:"Switch Chain",SmartSessionCreated:void 0,SmartSessionList:"Smart Sessions",SIWXSignMessage:"Sign In",PayLoading:"Payment in Progress",DataCapture:"Profile",DataCaptureOtpConfirm:"Confirm Email",FundWallet:"Fund Wallet",PayWithExchange:"Deposit from Exchange",PayWithExchangeSelectAsset:"Select Asset"}}let am=class extends d.WF{constructor(){super(),this.unsubscribe=[],this.heading=al()[l.I.state.view],this.network=i.W.state.activeCaipNetwork,this.networkImage=Y.$.getNetworkImage(this.network),this.showBack=!1,this.prevHistoryLength=1,this.view=l.I.state.view,this.viewDirection="",this.unsubscribe.push(Z.j.subscribeNetworkImages(()=>{this.networkImage=Y.$.getNetworkImage(this.network)}),l.I.subscribeKey("view",a=>{setTimeout(()=>{this.view=a,this.heading=al()[a]},ag.o.ANIMATION_DURATIONS.HeaderText),this.onViewChange(),this.onHistoryChange()}),i.W.subscribeKey("activeCaipNetwork",a=>{this.network=a,this.networkImage=Y.$.getNetworkImage(this.network)}))}disconnectCallback(){this.unsubscribe.forEach(a=>a())}render(){let a=ak[l.I.state.view]??K.f.tokens.theme.backgroundPrimary;return this.style.setProperty("--local-header-background-color",a),(0,d.qy)`
      <wui-flex
        .padding=${["0","4","0","4"]}
        justifyContent="space-between"
        alignItems="center"
      >
        ${this.leftHeaderTemplate()} ${this.titleTemplate()} ${this.rightHeaderTemplate()}
      </wui-flex>
    `}onWalletHelp(){F.E.sendEvent({type:"track",event:"CLICK_WALLET_HELP"}),l.I.push("WhatIsAWallet")}async onClose(){await o.safeClose()}rightHeaderTemplate(){let a=g.H?.state?.features?.smartSessions;return"Account"===l.I.state.view&&a?(0,d.qy)`<wui-flex>
      <wui-icon-button
        icon="clock"
        size="lg"
        iconSize="lg"
        type="neutral"
        variant="primary"
        @click=${()=>l.I.push("SmartSessionList")}
        data-testid="w3m-header-smart-sessions"
      ></wui-icon-button>
      ${this.closeButtonTemplate()}
    </wui-flex> `:this.closeButtonTemplate()}closeButtonTemplate(){return(0,d.qy)`
      <wui-icon-button
        icon="close"
        size="lg"
        type="neutral"
        variant="primary"
        iconSize="lg"
        @click=${this.onClose.bind(this)}
        data-testid="w3m-header-close"
      ></wui-icon-button>
    `}titleTemplate(){let a=aj.includes(this.view);return(0,d.qy)`
      <wui-flex
        view-direction="${this.viewDirection}"
        class="w3m-header-title"
        alignItems="center"
        gap="2"
      >
        <wui-text
          display="inline"
          variant="lg-regular"
          color="primary"
          data-testid="w3m-header-text"
        >
          ${this.heading}
        </wui-text>
        ${a?(0,d.qy)`<wui-tag variant="accent" size="md">Beta</wui-tag>`:null}
      </wui-flex>
    `}leftHeaderTemplate(){let{view:a}=l.I.state,b="Connect"===a,c=g.H.state.enableEmbedded,e=g.H.state.enableNetworkSwitch;return"Account"===a&&e?(0,d.qy)`<wui-select
        id="dynamic"
        data-testid="w3m-account-select-network"
        active-network=${(0,f.J)(this.network?.name)}
        @click=${this.onNetworks.bind(this)}
        imageSrc=${(0,f.J)(this.networkImage)}
      ></wui-select>`:this.showBack&&!("ApproveTransaction"===a||"ConnectingSiwe"===a||b&&c)?(0,d.qy)`<wui-icon-button
        data-testid="header-back"
        id="dynamic"
        icon="chevronLeft"
        size="lg"
        iconSize="lg"
        type="neutral"
        variant="primary"
        @click=${this.onGoBack.bind(this)}
      ></wui-icon-button>`:(0,d.qy)`<wui-icon-button
      data-hidden=${!b}
      id="dynamic"
      icon="helpCircle"
      size="lg"
      iconSize="lg"
      type="neutral"
      variant="primary"
      @click=${this.onWalletHelp.bind(this)}
    ></wui-icon-button>`}onNetworks(){this.isAllowedNetworkSwitch()&&(F.E.sendEvent({type:"track",event:"CLICK_NETWORKS"}),l.I.push("Networks"))}isAllowedNetworkSwitch(){let a=i.W.getAllRequestedCaipNetworks(),b=!!a&&a.length>1,c=a?.find(({id:a})=>a===this.network?.id);return b||!c}onViewChange(){let{history:a}=l.I.state,b=ag.o.VIEW_DIRECTION.Next;a.length<this.prevHistoryLength&&(b=ag.o.VIEW_DIRECTION.Prev),this.prevHistoryLength=a.length,this.viewDirection=b}async onHistoryChange(){let{history:a}=l.I.state,b=this.shadowRoot?.querySelector("#dynamic");a.length>1&&!this.showBack&&b?(await b.animate([{opacity:1},{opacity:0}],{duration:200,fill:"forwards",easing:"ease"}).finished,this.showBack=!0,b.animate([{opacity:0},{opacity:1}],{duration:200,fill:"forwards",easing:"ease"})):a.length<=1&&this.showBack&&b&&(await b.animate([{opacity:1},{opacity:0}],{duration:200,fill:"forwards",easing:"ease"}).finished,this.showBack=!1,b.animate([{opacity:0},{opacity:1}],{duration:200,fill:"forwards",easing:"ease"}))}onGoBack(){l.I.goBack()}};am.styles=ah,ai([(0,e.wk)()],am.prototype,"heading",void 0),ai([(0,e.wk)()],am.prototype,"network",void 0),ai([(0,e.wk)()],am.prototype,"networkImage",void 0),ai([(0,e.wk)()],am.prototype,"showBack",void 0),ai([(0,e.wk)()],am.prototype,"prevHistoryLength",void 0),ai([(0,e.wk)()],am.prototype,"view",void 0),ai([(0,e.wk)()],am.prototype,"viewDirection",void 0),am=ai([(0,K.EM)("w3m-header")],am),c(74085),c(42502);let an=(0,N.AH)`
  :host {
    display: flex;
    align-items: center;
    gap: ${({spacing:a})=>a[1]};
    padding: ${({spacing:a})=>a[2]} ${({spacing:a})=>a[3]}
      ${({spacing:a})=>a[2]} ${({spacing:a})=>a[2]};
    border-radius: ${({borderRadius:a})=>a[20]};
    background-color: ${({tokens:a})=>a.theme.foregroundPrimary};
    box-shadow:
      0px 0px 8px 0px rgba(0, 0, 0, 0.1),
      inset 0 0 0 1px ${({tokens:a})=>a.theme.borderPrimary};
    max-width: 320px;
  }

  wui-icon-box {
    border-radius: ${({borderRadius:a})=>a.round} !important;
    overflow: hidden;
  }

  wui-loading-spinner {
    padding: ${({spacing:a})=>a[1]};
    background-color: ${({tokens:a})=>a.core.foregroundAccent010};
    border-radius: ${({borderRadius:a})=>a.round} !important;
  }
`;var ao=function(a,b,c,d){var e,f=arguments.length,g=f<3?b:null===d?d=Object.getOwnPropertyDescriptor(b,c):d;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)g=Reflect.decorate(a,b,c,d);else for(var h=a.length-1;h>=0;h--)(e=a[h])&&(g=(f<3?e(g):f>3?e(b,c,g):e(b,c))||g);return f>3&&g&&Object.defineProperty(b,c,g),g};let ap=class extends d.WF{constructor(){super(...arguments),this.message="",this.variant="success"}render(){return(0,d.qy)`
      ${this.templateIcon()}
      <wui-text variant="lg-regular" color="primary" data-testid="wui-snackbar-message"
        >${this.message}</wui-text
      >
    `}templateIcon(){return"loading"===this.variant?(0,d.qy)`<wui-loading-spinner size="md" color="accent-primary"></wui-loading-spinner>`:(0,d.qy)`<wui-icon-box
      size="md"
      color=${({success:"success",error:"error",warning:"warning",info:"default"})[this.variant]}
      icon=${({success:"checkmark",error:"warning",warning:"warningCircle",info:"info"})[this.variant]}
    ></wui-icon-box>`}};ap.styles=[L.W5,an],ao([(0,e.MZ)()],ap.prototype,"message",void 0),ao([(0,e.MZ)()],ap.prototype,"variant",void 0),ap=ao([(0,M.E)("wui-snackbar")],ap);let aq=(0,d.AH)`
  :host {
    display: block;
    position: absolute;
    opacity: 0;
    pointer-events: none;
    top: 11px;
    left: 50%;
    width: max-content;
  }
`;var ar=function(a,b,c,d){var e,f=arguments.length,g=f<3?b:null===d?d=Object.getOwnPropertyDescriptor(b,c):d;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)g=Reflect.decorate(a,b,c,d);else for(var h=a.length-1;h>=0;h--)(e=a[h])&&(g=(f<3?e(g):f>3?e(b,c,g):e(b,c))||g);return f>3&&g&&Object.defineProperty(b,c,g),g};let as=class extends d.WF{constructor(){super(),this.unsubscribe=[],this.timeout=void 0,this.open=q.P.state.open,this.unsubscribe.push(q.P.subscribeKey("open",a=>{this.open=a,this.onOpen()}))}disconnectedCallback(){clearTimeout(this.timeout),this.unsubscribe.forEach(a=>a())}render(){let{message:a,variant:b}=q.P.state;return(0,d.qy)` <wui-snackbar message=${a} variant=${b}></wui-snackbar> `}onOpen(){clearTimeout(this.timeout),this.open?(this.animate([{opacity:0,transform:"translateX(-50%) scale(0.85)"},{opacity:1,transform:"translateX(-50%) scale(1)"}],{duration:150,fill:"forwards",easing:"ease"}),this.timeout&&clearTimeout(this.timeout),q.P.state.autoClose&&(this.timeout=setTimeout(()=>q.P.hide(),2500))):this.animate([{opacity:1,transform:"translateX(-50%) scale(1)"},{opacity:0,transform:"translateX(-50%) scale(0.85)"}],{duration:150,fill:"forwards",easing:"ease"})}};as.styles=aq,ar([(0,e.wk)()],as.prototype,"open",void 0),as=ar([(0,K.EM)("w3m-snackbar")],as);let at=(0,r.BX)({message:"",open:!1,triggerRect:{width:0,height:0,top:0,left:0},variant:"shade"}),au=(0,C.X)({state:at,subscribe:a=>(0,r.B1)(at,()=>a(at)),subscribeKey:(a,b)=>(0,s.u$)(at,a,b),showTooltip({message:a,triggerRect:b,variant:c}){at.open=!0,at.message=a,at.triggerRect=b,at.variant=c},hide(){at.open=!1,at.message="",at.triggerRect={width:0,height:0,top:0,left:0}}});c(52958);let av=(0,K.AH)`
  :host {
    pointer-events: none;
  }

  :host > wui-flex {
    display: var(--w3m-tooltip-display);
    opacity: var(--w3m-tooltip-opacity);
    padding: 9px ${({spacing:a})=>a["3"]} 10px ${({spacing:a})=>a["3"]};
    border-radius: ${({borderRadius:a})=>a["3"]};
    color: ${({tokens:a})=>a.theme.backgroundPrimary};
    position: absolute;
    top: var(--w3m-tooltip-top);
    left: var(--w3m-tooltip-left);
    transform: translate(calc(-50% + var(--w3m-tooltip-parent-width)), calc(-100% - 8px));
    max-width: calc(var(--apkt-modal-width) - ${({spacing:a})=>a["5"]});
    transition: opacity ${({durations:a})=>a.lg}
      ${({easings:a})=>a["ease-out-power-2"]};
    will-change: opacity;
    opacity: 0;
    animation-duration: ${({durations:a})=>a.xl};
    animation-timing-function: ${({easings:a})=>a["ease-out-power-2"]};
    animation-name: fade-in;
    animation-fill-mode: forwards;
  }

  :host([data-variant='shade']) > wui-flex {
    background-color: ${({tokens:a})=>a.theme.foregroundPrimary};
  }

  :host([data-variant='shade']) > wui-flex > wui-text {
    color: ${({tokens:a})=>a.theme.textSecondary};
  }

  :host([data-variant='fill']) > wui-flex {
    background-color: ${({tokens:a})=>a.theme.textPrimary};
    border: none;
  }

  wui-icon {
    position: absolute;
    width: 12px !important;
    height: 4px !important;
    color: ${({tokens:a})=>a.theme.foregroundPrimary};
  }

  wui-icon[data-placement='top'] {
    bottom: 0px;
    left: 50%;
    transform: translate(-50%, 95%);
  }

  wui-icon[data-placement='bottom'] {
    top: 0;
    left: 50%;
    transform: translate(-50%, -95%) rotate(180deg);
  }

  wui-icon[data-placement='right'] {
    top: 50%;
    left: 0;
    transform: translate(-65%, -50%) rotate(90deg);
  }

  wui-icon[data-placement='left'] {
    top: 50%;
    right: 0%;
    transform: translate(65%, -50%) rotate(270deg);
  }

  @keyframes fade-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;var aw=function(a,b,c,d){var e,f=arguments.length,g=f<3?b:null===d?d=Object.getOwnPropertyDescriptor(b,c):d;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)g=Reflect.decorate(a,b,c,d);else for(var h=a.length-1;h>=0;h--)(e=a[h])&&(g=(f<3?e(g):f>3?e(b,c,g):e(b,c))||g);return f>3&&g&&Object.defineProperty(b,c,g),g};let ax=class extends d.WF{constructor(){super(),this.unsubscribe=[],this.open=au.state.open,this.message=au.state.message,this.triggerRect=au.state.triggerRect,this.variant=au.state.variant,this.unsubscribe.push(au.subscribe(a=>{this.open=a.open,this.message=a.message,this.triggerRect=a.triggerRect,this.variant=a.variant}))}disconnectedCallback(){this.unsubscribe.forEach(a=>a())}render(){this.dataset.variant=this.variant;let a=this.triggerRect.top,b=this.triggerRect.left;return this.style.cssText=`
    --w3m-tooltip-top: ${a}px;
    --w3m-tooltip-left: ${b}px;
    --w3m-tooltip-parent-width: ${this.triggerRect.width/2}px;
    --w3m-tooltip-display: ${this.open?"flex":"none"};
    --w3m-tooltip-opacity: ${+!!this.open};
    `,(0,d.qy)`<wui-flex>
      <wui-icon data-placement="top" size="inherit" name="cursor"></wui-icon>
      <wui-text color="primary" variant="sm-regular">${this.message}</wui-text>
    </wui-flex>`}};ax.styles=[av],aw([(0,e.wk)()],ax.prototype,"open",void 0),aw([(0,e.wk)()],ax.prototype,"message",void 0),aw([(0,e.wk)()],ax.prototype,"triggerRect",void 0),aw([(0,e.wk)()],ax.prototype,"variant",void 0),ax=aw([(0,K.EM)("w3m-tooltip")],ax);let ay={getTabsByNamespace:a=>a&&a===u.o.CHAIN.EVM?g.H.state.remoteFeatures?.activity===!1?ag.o.ACCOUNT_TABS.filter(a=>"Activity"!==a.label):ag.o.ACCOUNT_TABS:[],isValidReownName:a=>/^[a-zA-Z0-9]+$/gu.test(a),isValidEmail:a=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/gu.test(a),validateReownName:a=>a.replace(/\^/gu,"").toLowerCase().replace(/[^a-zA-Z0-9]/gu,""),hasFooter(){let a=l.I.state.view;if(ag.o.VIEWS_WITH_LEGAL_FOOTER.includes(a)){let{termsConditionsUrl:a,privacyPolicyUrl:b}=g.H.state,c=g.H.state.features?.legalCheckbox;return(!!a||!!b)&&!c}return ag.o.VIEWS_WITH_DEFAULT_FOOTER.includes(a)}};c(16152);let az=(0,K.AH)`
  :host wui-ux-by-reown {
    padding-top: 0;
  }

  :host wui-ux-by-reown.branding-only {
    padding-top: ${({spacing:a})=>a["3"]};
  }

  a {
    text-decoration: none;
    color: ${({tokens:a})=>a.core.textAccentPrimary};
    font-weight: 500;
  }
`;var aA=function(a,b,c,d){var e,f=arguments.length,g=f<3?b:null===d?d=Object.getOwnPropertyDescriptor(b,c):d;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)g=Reflect.decorate(a,b,c,d);else for(var h=a.length-1;h>=0;h--)(e=a[h])&&(g=(f<3?e(g):f>3?e(b,c,g):e(b,c))||g);return f>3&&g&&Object.defineProperty(b,c,g),g};let aB=class extends d.WF{constructor(){super(),this.unsubscribe=[],this.remoteFeatures=g.H.state.remoteFeatures,this.unsubscribe.push(g.H.subscribeKey("remoteFeatures",a=>this.remoteFeatures=a))}disconnectedCallback(){this.unsubscribe.forEach(a=>a())}render(){let{termsConditionsUrl:a,privacyPolicyUrl:b}=g.H.state,c=g.H.state.features?.legalCheckbox;return(a||b)&&!c?(0,d.qy)`
      <wui-flex flexDirection="column">
        <wui-flex .padding=${["4","3","3","3"]} justifyContent="center">
          <wui-text color="secondary" variant="md-regular" align="center">
            By connecting your wallet, you agree to our <br />
            ${this.termsTemplate()} ${this.andTemplate()} ${this.privacyTemplate()}
          </wui-text>
        </wui-flex>
        ${this.reownBrandingTemplate()}
      </wui-flex>
    `:(0,d.qy)`
        <wui-flex flexDirection="column"> ${this.reownBrandingTemplate(!0)} </wui-flex>
      `}andTemplate(){let{termsConditionsUrl:a,privacyPolicyUrl:b}=g.H.state;return a&&b?"and":""}termsTemplate(){let{termsConditionsUrl:a}=g.H.state;return a?(0,d.qy)`<a href=${a} target="_blank" rel="noopener noreferrer"
      >Terms of Service</a
    >`:null}privacyTemplate(){let{privacyPolicyUrl:a}=g.H.state;return a?(0,d.qy)`<a href=${a} target="_blank" rel="noopener noreferrer"
      >Privacy Policy</a
    >`:null}reownBrandingTemplate(a=!1){return this.remoteFeatures?.reownBranding?a?(0,d.qy)`<wui-ux-by-reown class="branding-only"></wui-ux-by-reown>`:(0,d.qy)`<wui-ux-by-reown></wui-ux-by-reown>`:null}};aB.styles=[az],aA([(0,e.wk)()],aB.prototype,"remoteFeatures",void 0),aB=aA([(0,K.EM)("w3m-legal-footer")],aB),c(26838);let aC=(0,d.AH)``,aD=class extends d.WF{render(){let{termsConditionsUrl:a,privacyPolicyUrl:b}=g.H.state;return a||b?(0,d.qy)`
      <wui-flex
        .padding=${["4","3","3","3"]}
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        gap="3"
      >
        <wui-text color="secondary" variant="md-regular" align="center">
          We work with the best providers to give you the lowest fees and best support. More options
          coming soon!
        </wui-text>

        ${this.howDoesItWorkTemplate()}
      </wui-flex>
    `:null}howDoesItWorkTemplate(){return(0,d.qy)` <wui-link @click=${this.onWhatIsBuy.bind(this)}>
      <wui-icon size="xs" color="accent-primary" slot="iconLeft" name="helpCircle"></wui-icon>
      How does it work?
    </wui-link>`}onWhatIsBuy(){F.E.sendEvent({type:"track",event:"SELECT_WHAT_IS_A_BUY",properties:{isSmartAccount:(0,x.lj)(i.W.state.activeChain)===v.Vl.ACCOUNT_TYPES.SMART_ACCOUNT}}),l.I.push("WhatIsABuy")}};aD.styles=[aC],aD=function(a,b,c,d){var e,f=arguments.length,g=f<3?b:null===d?d=Object.getOwnPropertyDescriptor(b,c):d;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)g=Reflect.decorate(a,b,c,d);else for(var h=a.length-1;h>=0;h--)(e=a[h])&&(g=(f<3?e(g):f>3?e(b,c,g):e(b,c))||g);return f>3&&g&&Object.defineProperty(b,c,g),g}([(0,K.EM)("w3m-onramp-providers-footer")],aD);let aE=(0,K.AH)`
  :host {
    display: block;
  }

  div.container {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    overflow: hidden;
    height: auto;
    display: block;
  }

  div.container[status='hide'] {
    animation: fade-out;
    animation-duration: var(--apkt-duration-dynamic);
    animation-timing-function: ${({easings:a})=>a["ease-out-power-2"]};
    animation-fill-mode: both;
    animation-delay: 0s;
  }

  div.container[status='show'] {
    animation: fade-in;
    animation-duration: var(--apkt-duration-dynamic);
    animation-timing-function: ${({easings:a})=>a["ease-out-power-2"]};
    animation-fill-mode: both;
    animation-delay: var(--apkt-duration-dynamic);
  }

  @keyframes fade-in {
    from {
      opacity: 0;
      filter: blur(6px);
    }
    to {
      opacity: 1;
      filter: blur(0px);
    }
  }

  @keyframes fade-out {
    from {
      opacity: 1;
      filter: blur(0px);
    }
    to {
      opacity: 0;
      filter: blur(6px);
    }
  }
`;var aF=function(a,b,c,d){var e,f=arguments.length,g=f<3?b:null===d?d=Object.getOwnPropertyDescriptor(b,c):d;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)g=Reflect.decorate(a,b,c,d);else for(var h=a.length-1;h>=0;h--)(e=a[h])&&(g=(f<3?e(g):f>3?e(b,c,g):e(b,c))||g);return f>3&&g&&Object.defineProperty(b,c,g),g};let aG=class extends d.WF{constructor(){super(...arguments),this.resizeObserver=void 0,this.unsubscribe=[],this.status="hide",this.view=l.I.state.view}firstUpdated(){this.status=ay.hasFooter()?"show":"hide",this.unsubscribe.push(l.I.subscribeKey("view",a=>{this.view=a,this.status=ay.hasFooter()?"show":"hide","hide"===this.status&&document.documentElement.style.setProperty("--apkt-footer-height","0px")})),this.resizeObserver=new ResizeObserver(a=>{for(let b of a)if(b.target===this.getWrapper()){let a=`${b.contentRect.height}px`;document.documentElement.style.setProperty("--apkt-footer-height",a)}}),this.resizeObserver.observe(this.getWrapper())}render(){return(0,d.qy)`
      <div class="container" status=${this.status}>${this.templatePageContainer()}</div>
    `}templatePageContainer(){return ay.hasFooter()?(0,d.qy)` ${this.templateFooter()}`:null}templateFooter(){switch(this.view){case"Networks":return this.templateNetworksFooter();case"Connect":case"ConnectWallets":case"OnRampFiatSelect":case"OnRampTokenSelect":return(0,d.qy)`<w3m-legal-footer></w3m-legal-footer>`;case"OnRampProviders":return(0,d.qy)`<w3m-onramp-providers-footer></w3m-onramp-providers-footer>`;default:return null}}templateNetworksFooter(){return(0,d.qy)` <wui-flex
      class="footer-in"
      padding="3"
      flexDirection="column"
      gap="3"
      alignItems="center"
    >
      <wui-text variant="md-regular" color="secondary" align="center">
        Your connected wallet may not support some of the networks available for this dApp
      </wui-text>
      <wui-link @click=${this.onNetworkHelp.bind(this)}>
        <wui-icon size="sm" color="accent-primary" slot="iconLeft" name="helpCircle"></wui-icon>
        What is a network
      </wui-link>
    </wui-flex>`}onNetworkHelp(){F.E.sendEvent({type:"track",event:"CLICK_NETWORK_HELP"}),l.I.push("WhatIsANetwork")}getWrapper(){return this.shadowRoot?.querySelector("div.container")}};aG.styles=[aE],aF([(0,e.wk)()],aG.prototype,"status",void 0),aF([(0,e.wk)()],aG.prototype,"view",void 0),aG=aF([(0,K.EM)("w3m-footer")],aG);let aH=(0,K.AH)`
  :host {
    display: block;
    width: inherit;
  }
`;var aI=function(a,b,c,d){var e,f=arguments.length,g=f<3?b:null===d?d=Object.getOwnPropertyDescriptor(b,c):d;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)g=Reflect.decorate(a,b,c,d);else for(var h=a.length-1;h>=0;h--)(e=a[h])&&(g=(f<3?e(g):f>3?e(b,c,g):e(b,c))||g);return f>3&&g&&Object.defineProperty(b,c,g),g};let aJ=class extends d.WF{constructor(){super(),this.unsubscribe=[],this.viewState=l.I.state.view,this.history=l.I.state.history.join(","),this.unsubscribe.push(l.I.subscribeKey("view",()=>{this.history=l.I.state.history.join(","),document.documentElement.style.setProperty("--apkt-duration-dynamic","var(--apkt-durations-lg)")}))}disconnectedCallback(){this.unsubscribe.forEach(a=>a()),document.documentElement.style.setProperty("--apkt-duration-dynamic","0s")}render(){return(0,d.qy)`${this.templatePageContainer()}`}templatePageContainer(){return(0,d.qy)`<w3m-router-container
      history=${this.history}
      .setView=${()=>{this.viewState=l.I.state.view}}
    >
      ${this.viewTemplate(this.viewState)}
    </w3m-router-container>`}viewTemplate(a){switch(a){case"AccountSettings":return(0,d.qy)`<w3m-account-settings-view></w3m-account-settings-view>`;case"Account":return(0,d.qy)`<w3m-account-view></w3m-account-view>`;case"AllWallets":return(0,d.qy)`<w3m-all-wallets-view></w3m-all-wallets-view>`;case"ApproveTransaction":return(0,d.qy)`<w3m-approve-transaction-view></w3m-approve-transaction-view>`;case"BuyInProgress":return(0,d.qy)`<w3m-buy-in-progress-view></w3m-buy-in-progress-view>`;case"ChooseAccountName":return(0,d.qy)`<w3m-choose-account-name-view></w3m-choose-account-name-view>`;case"Connect":default:return(0,d.qy)`<w3m-connect-view></w3m-connect-view>`;case"Create":return(0,d.qy)`<w3m-connect-view walletGuide="explore"></w3m-connect-view>`;case"ConnectingWalletConnect":return(0,d.qy)`<w3m-connecting-wc-view></w3m-connecting-wc-view>`;case"ConnectingWalletConnectBasic":return(0,d.qy)`<w3m-connecting-wc-basic-view></w3m-connecting-wc-basic-view>`;case"ConnectingExternal":return(0,d.qy)`<w3m-connecting-external-view></w3m-connecting-external-view>`;case"ConnectingSiwe":return(0,d.qy)`<w3m-connecting-siwe-view></w3m-connecting-siwe-view>`;case"ConnectWallets":return(0,d.qy)`<w3m-connect-wallets-view></w3m-connect-wallets-view>`;case"ConnectSocials":return(0,d.qy)`<w3m-connect-socials-view></w3m-connect-socials-view>`;case"ConnectingSocial":return(0,d.qy)`<w3m-connecting-social-view></w3m-connecting-social-view>`;case"DataCapture":return(0,d.qy)`<w3m-data-capture-view></w3m-data-capture-view>`;case"DataCaptureOtpConfirm":return(0,d.qy)`<w3m-data-capture-otp-confirm-view></w3m-data-capture-otp-confirm-view>`;case"Downloads":return(0,d.qy)`<w3m-downloads-view></w3m-downloads-view>`;case"EmailLogin":return(0,d.qy)`<w3m-email-login-view></w3m-email-login-view>`;case"EmailVerifyOtp":return(0,d.qy)`<w3m-email-verify-otp-view></w3m-email-verify-otp-view>`;case"EmailVerifyDevice":return(0,d.qy)`<w3m-email-verify-device-view></w3m-email-verify-device-view>`;case"GetWallet":return(0,d.qy)`<w3m-get-wallet-view></w3m-get-wallet-view>`;case"Networks":return(0,d.qy)`<w3m-networks-view></w3m-networks-view>`;case"SwitchNetwork":return(0,d.qy)`<w3m-network-switch-view></w3m-network-switch-view>`;case"ProfileWallets":return(0,d.qy)`<w3m-profile-wallets-view></w3m-profile-wallets-view>`;case"Transactions":return(0,d.qy)`<w3m-transactions-view></w3m-transactions-view>`;case"OnRampProviders":return(0,d.qy)`<w3m-onramp-providers-view></w3m-onramp-providers-view>`;case"OnRampTokenSelect":return(0,d.qy)`<w3m-onramp-token-select-view></w3m-onramp-token-select-view>`;case"OnRampFiatSelect":return(0,d.qy)`<w3m-onramp-fiat-select-view></w3m-onramp-fiat-select-view>`;case"UpgradeEmailWallet":return(0,d.qy)`<w3m-upgrade-wallet-view></w3m-upgrade-wallet-view>`;case"UpdateEmailWallet":return(0,d.qy)`<w3m-update-email-wallet-view></w3m-update-email-wallet-view>`;case"UpdateEmailPrimaryOtp":return(0,d.qy)`<w3m-update-email-primary-otp-view></w3m-update-email-primary-otp-view>`;case"UpdateEmailSecondaryOtp":return(0,d.qy)`<w3m-update-email-secondary-otp-view></w3m-update-email-secondary-otp-view>`;case"UnsupportedChain":return(0,d.qy)`<w3m-unsupported-chain-view></w3m-unsupported-chain-view>`;case"Swap":return(0,d.qy)`<w3m-swap-view></w3m-swap-view>`;case"SwapSelectToken":return(0,d.qy)`<w3m-swap-select-token-view></w3m-swap-select-token-view>`;case"SwapPreview":return(0,d.qy)`<w3m-swap-preview-view></w3m-swap-preview-view>`;case"WalletSend":return(0,d.qy)`<w3m-wallet-send-view></w3m-wallet-send-view>`;case"WalletSendSelectToken":return(0,d.qy)`<w3m-wallet-send-select-token-view></w3m-wallet-send-select-token-view>`;case"WalletSendPreview":return(0,d.qy)`<w3m-wallet-send-preview-view></w3m-wallet-send-preview-view>`;case"WalletSendConfirmed":return(0,d.qy)`<w3m-send-confirmed-view></w3m-send-confirmed-view>`;case"WhatIsABuy":return(0,d.qy)`<w3m-what-is-a-buy-view></w3m-what-is-a-buy-view>`;case"WalletReceive":return(0,d.qy)`<w3m-wallet-receive-view></w3m-wallet-receive-view>`;case"WalletCompatibleNetworks":return(0,d.qy)`<w3m-wallet-compatible-networks-view></w3m-wallet-compatible-networks-view>`;case"WhatIsAWallet":return(0,d.qy)`<w3m-what-is-a-wallet-view></w3m-what-is-a-wallet-view>`;case"ConnectingMultiChain":return(0,d.qy)`<w3m-connecting-multi-chain-view></w3m-connecting-multi-chain-view>`;case"WhatIsANetwork":return(0,d.qy)`<w3m-what-is-a-network-view></w3m-what-is-a-network-view>`;case"ConnectingFarcaster":return(0,d.qy)`<w3m-connecting-farcaster-view></w3m-connecting-farcaster-view>`;case"SwitchActiveChain":return(0,d.qy)`<w3m-switch-active-chain-view></w3m-switch-active-chain-view>`;case"RegisterAccountName":return(0,d.qy)`<w3m-register-account-name-view></w3m-register-account-name-view>`;case"RegisterAccountNameSuccess":return(0,d.qy)`<w3m-register-account-name-success-view></w3m-register-account-name-success-view>`;case"SmartSessionCreated":return(0,d.qy)`<w3m-smart-session-created-view></w3m-smart-session-created-view>`;case"SmartSessionList":return(0,d.qy)`<w3m-smart-session-list-view></w3m-smart-session-list-view>`;case"SIWXSignMessage":return(0,d.qy)`<w3m-siwx-sign-message-view></w3m-siwx-sign-message-view>`;case"Pay":return(0,d.qy)`<w3m-pay-view></w3m-pay-view>`;case"PayLoading":return(0,d.qy)`<w3m-pay-loading-view></w3m-pay-loading-view>`;case"FundWallet":return(0,d.qy)`<w3m-fund-wallet-view></w3m-fund-wallet-view>`;case"PayWithExchange":return(0,d.qy)`<w3m-deposit-from-exchange-view></w3m-deposit-from-exchange-view>`;case"PayWithExchangeSelectAsset":return(0,d.qy)`<w3m-deposit-from-exchange-select-asset-view></w3m-deposit-from-exchange-select-asset-view>`;case"UsageExceeded":return(0,d.qy)`<w3m-usage-exceeded-view></w3m-usage-exceeded-view>`}}};aJ.styles=[aH],aI([(0,e.wk)()],aJ.prototype,"viewState",void 0),aI([(0,e.wk)()],aJ.prototype,"history",void 0),aJ=aI([(0,K.EM)("w3m-router")],aJ);let aK=(0,K.AH)`
  :host {
    z-index: ${({tokens:a})=>a.core.zIndex};
    display: block;
    backface-visibility: hidden;
    will-change: opacity;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    opacity: 0;
    background-color: ${({tokens:a})=>a.theme.overlay};
    backdrop-filter: blur(0px);
    transition:
      opacity ${({durations:a})=>a.lg} ${({easings:a})=>a["ease-out-power-2"]},
      backdrop-filter ${({durations:a})=>a.lg}
        ${({easings:a})=>a["ease-out-power-2"]};
    will-change: opacity;
  }

  :host(.open) {
    opacity: 1;
    backdrop-filter: blur(8px);
  }

  :host(.appkit-modal) {
    position: relative;
    pointer-events: unset;
    background: none;
    width: 100%;
    opacity: 1;
  }

  wui-card {
    max-width: var(--apkt-modal-width);
    width: 100%;
    position: relative;
    outline: none;
    transform: translateY(4px);
    box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.05);
    transition:
      transform ${({durations:a})=>a.lg}
        ${({easings:a})=>a["ease-out-power-2"]},
      border-radius ${({durations:a})=>a.lg}
        ${({easings:a})=>a["ease-out-power-1"]},
      background-color ${({durations:a})=>a.lg}
        ${({easings:a})=>a["ease-out-power-1"]},
      box-shadow ${({durations:a})=>a.lg}
        ${({easings:a})=>a["ease-out-power-1"]};
    will-change: border-radius, background-color, transform, box-shadow;
    background-color: ${({tokens:a})=>a.theme.backgroundPrimary};
    padding: var(--local-modal-padding);
    box-sizing: border-box;
  }

  :host(.open) wui-card {
    transform: translateY(0px);
  }

  wui-card::before {
    z-index: 1;
    pointer-events: none;
    content: '';
    position: absolute;
    inset: 0;
    border-radius: clamp(0px, var(--apkt-borderRadius-8), 44px);
    transition: box-shadow ${({durations:a})=>a.lg}
      ${({easings:a})=>a["ease-out-power-2"]};
    transition-delay: ${({durations:a})=>a.md};
    will-change: box-shadow;
  }

  :host([data-mobile-fullscreen='true']) wui-card::before {
    border-radius: 0px;
  }

  :host([data-border='true']) wui-card::before {
    box-shadow: inset 0px 0px 0px 4px ${({tokens:a})=>a.theme.foregroundSecondary};
  }

  :host([data-border='false']) wui-card::before {
    box-shadow: inset 0px 0px 0px 1px ${({tokens:a})=>a.theme.borderPrimaryDark};
  }

  :host([data-border='true']) wui-card {
    animation:
      fade-in ${({durations:a})=>a.lg} ${({easings:a})=>a["ease-out-power-2"]},
      card-background-border var(--apkt-duration-dynamic)
        ${({easings:a})=>a["ease-out-power-2"]};
    animation-fill-mode: backwards, both;
    animation-delay: var(--apkt-duration-dynamic);
  }

  :host([data-border='false']) wui-card {
    animation:
      fade-in ${({durations:a})=>a.lg} ${({easings:a})=>a["ease-out-power-2"]},
      card-background-default var(--apkt-duration-dynamic)
        ${({easings:a})=>a["ease-out-power-2"]};
    animation-fill-mode: backwards, both;
    animation-delay: 0s;
  }

  :host(.appkit-modal) wui-card {
    max-width: var(--apkt-modal-width);
  }

  wui-card[shake='true'] {
    animation:
      fade-in ${({durations:a})=>a.lg} ${({easings:a})=>a["ease-out-power-2"]},
      w3m-shake ${({durations:a})=>a.xl}
        ${({easings:a})=>a["ease-out-power-2"]};
  }

  wui-flex {
    overflow-x: hidden;
    overflow-y: auto;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
  }

  @media (max-height: 700px) and (min-width: 431px) {
    wui-flex {
      align-items: flex-start;
    }

    wui-card {
      margin: var(--apkt-spacing-6) 0px;
    }
  }

  @media (max-width: 430px) {
    :host([data-mobile-fullscreen='true']) {
      height: 100dvh;
    }
    :host([data-mobile-fullscreen='true']) wui-flex {
      align-items: stretch;
    }
    :host([data-mobile-fullscreen='true']) wui-card {
      max-width: 100%;
      height: 100%;
      border-radius: 0;
      border: none;
    }
    :host(:not([data-mobile-fullscreen='true'])) wui-flex {
      align-items: flex-end;
    }

    :host(:not([data-mobile-fullscreen='true'])) wui-card {
      max-width: 100%;
      border-bottom: none;
    }

    :host(:not([data-mobile-fullscreen='true'])) wui-card[data-embedded='true'] {
      border-bottom-left-radius: clamp(0px, var(--apkt-borderRadius-8), 44px);
      border-bottom-right-radius: clamp(0px, var(--apkt-borderRadius-8), 44px);
    }

    :host(:not([data-mobile-fullscreen='true'])) wui-card:not([data-embedded='true']) {
      border-bottom-left-radius: 0px;
      border-bottom-right-radius: 0px;
    }

    wui-card[shake='true'] {
      animation: w3m-shake 0.5s ${({easings:a})=>a["ease-out-power-2"]};
    }
  }

  @keyframes fade-in {
    0% {
      transform: scale(0.99) translateY(4px);
    }
    100% {
      transform: scale(1) translateY(0);
    }
  }

  @keyframes w3m-shake {
    0% {
      transform: scale(1) rotate(0deg);
    }
    20% {
      transform: scale(1) rotate(-1deg);
    }
    40% {
      transform: scale(1) rotate(1.5deg);
    }
    60% {
      transform: scale(1) rotate(-1.5deg);
    }
    80% {
      transform: scale(1) rotate(1deg);
    }
    100% {
      transform: scale(1) rotate(0deg);
    }
  }

  @keyframes card-background-border {
    from {
      background-color: ${({tokens:a})=>a.theme.backgroundPrimary};
    }
    to {
      background-color: ${({tokens:a})=>a.theme.foregroundSecondary};
    }
  }

  @keyframes card-background-default {
    from {
      background-color: ${({tokens:a})=>a.theme.foregroundSecondary};
    }
    to {
      background-color: ${({tokens:a})=>a.theme.backgroundPrimary};
    }
  }
`;var aL=function(a,b,c,d){var e,f=arguments.length,g=f<3?b:null===d?d=Object.getOwnPropertyDescriptor(b,c):d;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)g=Reflect.decorate(a,b,c,d);else for(var h=a.length-1;h>=0;h--)(e=a[h])&&(g=(f<3?e(g):f>3?e(b,c,g):e(b,c))||g);return f>3&&g&&Object.defineProperty(b,c,g),g};let aM="scroll-lock",aN={PayWithExchange:"0",PayWithExchangeSelectAsset:"0"};class aO extends d.WF{constructor(){super(),this.unsubscribe=[],this.abortController=void 0,this.hasPrefetched=!1,this.enableEmbedded=g.H.state.enableEmbedded,this.open=h.W.state.open,this.caipAddress=i.W.state.activeCaipAddress,this.caipNetwork=i.W.state.activeCaipNetwork,this.shake=h.W.state.shake,this.filterByNamespace=j.a.state.filterByNamespace,this.padding=K.f.spacing[1],this.mobileFullScreen=g.H.state.enableMobileFullScreen,this.initializeTheming(),k.N.prefetchAnalyticsConfig(),this.unsubscribe.push(h.W.subscribeKey("open",a=>a?this.onOpen():this.onClose()),h.W.subscribeKey("shake",a=>this.shake=a),i.W.subscribeKey("activeCaipNetwork",a=>this.onNewNetwork(a)),i.W.subscribeKey("activeCaipAddress",a=>this.onNewAddress(a)),g.H.subscribeKey("enableEmbedded",a=>this.enableEmbedded=a),j.a.subscribeKey("filterByNamespace",a=>{this.filterByNamespace===a||i.W.getAccountData(a)?.caipAddress||(k.N.fetchRecommendedWallets(),this.filterByNamespace=a)}),l.I.subscribeKey("view",()=>{this.dataset.border=ay.hasFooter()?"true":"false",this.padding=aN[l.I.state.view]??K.f.spacing[1]}))}firstUpdated(){if(this.dataset.border=ay.hasFooter()?"true":"false",this.mobileFullScreen&&this.setAttribute("data-mobile-fullscreen","true"),this.caipAddress){if(this.enableEmbedded){h.W.close(),this.prefetch();return}this.onNewAddress(this.caipAddress)}this.open&&this.onOpen(),this.enableEmbedded&&this.prefetch()}disconnectedCallback(){this.unsubscribe.forEach(a=>a()),this.onRemoveKeyboardListener()}render(){return(this.style.setProperty("--local-modal-padding",this.padding),this.enableEmbedded)?(0,d.qy)`${this.contentTemplate()}
        <w3m-tooltip></w3m-tooltip> `:this.open?(0,d.qy)`
          <wui-flex @click=${this.onOverlayClick.bind(this)} data-testid="w3m-modal-overlay">
            ${this.contentTemplate()}
          </wui-flex>
          <w3m-tooltip></w3m-tooltip>
        `:null}contentTemplate(){return(0,d.qy)` <wui-card
      shake="${this.shake}"
      data-embedded="${(0,f.J)(this.enableEmbedded)}"
      role="alertdialog"
      aria-modal="true"
      tabindex="0"
      data-testid="w3m-modal-card"
    >
      <w3m-header></w3m-header>
      <w3m-router></w3m-router>
      <w3m-footer></w3m-footer>
      <w3m-snackbar></w3m-snackbar>
      <w3m-alertbar></w3m-alertbar>
    </wui-card>`}async onOverlayClick(a){a.target===a.currentTarget&&(this.mobileFullScreen||await this.handleClose())}async handleClose(){await o.safeClose()}initializeTheming(){let{themeVariables:a,themeMode:b}=p.W.state,c=K.Zv.getColorTheme(b);(0,K.RF)(a,c)}onClose(){this.open=!1,this.classList.remove("open"),this.onScrollUnlock(),q.P.hide(),this.onRemoveKeyboardListener()}onOpen(){this.open=!0,this.classList.add("open"),this.onScrollLock(),this.onAddKeyboardListener()}onScrollLock(){let a=document.createElement("style");a.dataset.w3m=aM,a.textContent=`
      body {
        touch-action: none;
        overflow: hidden;
        overscroll-behavior: contain;
      }
      w3m-modal {
        pointer-events: auto;
      }
    `,document.head.appendChild(a)}onScrollUnlock(){let a=document.head.querySelector(`style[data-w3m="${aM}"]`);a&&a.remove()}onAddKeyboardListener(){this.abortController=new AbortController;let a=this.shadowRoot?.querySelector("wui-card");a?.focus(),window.addEventListener("keydown",b=>{if("Escape"===b.key)this.handleClose();else if("Tab"===b.key){let{tagName:c}=b.target;!c||c.includes("W3M-")||c.includes("WUI-")||a?.focus()}},this.abortController)}onRemoveKeyboardListener(){this.abortController?.abort(),this.abortController=void 0}async onNewAddress(a){let b=i.W.state.isSwitchingNamespace,c="ProfileWallets"===l.I.state.view;a||b||c||h.W.close(),await n.U.initializeIfEnabled(a),this.caipAddress=a,i.W.setIsSwitchingNamespace(!1)}onNewNetwork(a){let b=this.caipNetwork,c=b?.caipNetworkId?.toString(),d=a?.caipNetworkId?.toString(),e="UnsupportedChain"===l.I.state.view,f=h.W.state.open,g=!1;this.enableEmbedded&&"SwitchNetwork"===l.I.state.view&&(g=!0),c!==d&&J.resetState(),f&&e&&(g=!0),g&&"SIWXSignMessage"!==l.I.state.view&&l.I.goBack(),this.caipNetwork=a}prefetch(){this.hasPrefetched||(k.N.prefetch(),k.N.fetchWalletsByPage({page:1}),this.hasPrefetched=!0)}}aO.styles=aK,aL([(0,e.MZ)({type:Boolean})],aO.prototype,"enableEmbedded",void 0),aL([(0,e.wk)()],aO.prototype,"open",void 0),aL([(0,e.wk)()],aO.prototype,"caipAddress",void 0),aL([(0,e.wk)()],aO.prototype,"caipNetwork",void 0),aL([(0,e.wk)()],aO.prototype,"shake",void 0),aL([(0,e.wk)()],aO.prototype,"filterByNamespace",void 0),aL([(0,e.wk)()],aO.prototype,"padding",void 0),aL([(0,e.wk)()],aO.prototype,"mobileFullScreen",void 0);let aP=class extends aO{};aP=aL([(0,K.EM)("w3m-modal")],aP);let aQ=class extends aO{};aQ=aL([(0,K.EM)("appkit-modal")],aQ),c(85087);let aR=(0,K.AH)`
  .icon-box {
    width: 64px;
    height: 64px;
    border-radius: ${({borderRadius:a})=>a[5]};
    background-color: ${({colors:a})=>a.semanticError010};
  }
`,aS=class extends d.WF{constructor(){super()}render(){return(0,d.qy)`
      <wui-flex
        flexDirection="column"
        alignItems="center"
        gap="4"
        .padding="${["1","3","4","3"]}"
      >
        <wui-flex justifyContent="center" alignItems="center" class="icon-box">
          <wui-icon size="xxl" color="error" name="warningCircle"></wui-icon>
        </wui-flex>

        <wui-text variant="lg-medium" color="primary" align="center">
          The app isn't responding as expected
        </wui-text>
        <wui-text variant="md-regular" color="secondary" align="center">
          Try again or reach out to the app team for help.
        </wui-text>

        <wui-button
          variant="neutral-secondary"
          size="md"
          @click=${this.onTryAgainClick.bind(this)}
          data-testid="w3m-usage-exceeded-button"
        >
          <wui-icon color="inherit" slot="iconLeft" name="refresh"></wui-icon>
          Try Again
        </wui-button>
      </wui-flex>
    `}onTryAgainClick(){l.I.goBack()}};aS.styles=aR,aS=function(a,b,c,d){var e,f=arguments.length,g=f<3?b:null===d?d=Object.getOwnPropertyDescriptor(b,c):d;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)g=Reflect.decorate(a,b,c,d);else for(var h=a.length-1;h>=0;h--)(e=a[h])&&(g=(f<3?e(g):f>3?e(b,c,g):e(b,c))||g);return f>3&&g&&Object.defineProperty(b,c,g),g}([(0,K.EM)("w3m-usage-exceeded-view")],aS),c(69970);let aT=(0,K.AH)`
  :host {
    width: 100%;
  }
`;var aU=function(a,b,c,d){var e,f=arguments.length,g=f<3?b:null===d?d=Object.getOwnPropertyDescriptor(b,c):d;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)g=Reflect.decorate(a,b,c,d);else for(var h=a.length-1;h>=0;h--)(e=a[h])&&(g=(f<3?e(g):f>3?e(b,c,g):e(b,c))||g);return f>3&&g&&Object.defineProperty(b,c,g),g};let aV=class extends d.WF{constructor(){super(...arguments),this.hasImpressionSent=!1,this.walletImages=[],this.imageSrc="",this.name="",this.size="md",this.tabIdx=void 0,this.disabled=!1,this.showAllWallets=!1,this.loading=!1,this.loadingSpinnerColor="accent-100",this.rdnsId="",this.displayIndex=void 0,this.walletRank=void 0}connectedCallback(){super.connectedCallback()}disconnectedCallback(){super.disconnectedCallback(),this.cleanupIntersectionObserver()}updated(a){super.updated(a),(a.has("name")||a.has("imageSrc")||a.has("walletRank"))&&(this.hasImpressionSent=!1),a.has("walletRank")&&this.walletRank&&!this.intersectionObserver&&this.setupIntersectionObserver()}setupIntersectionObserver(){this.intersectionObserver=new IntersectionObserver(a=>{a.forEach(a=>{!a.isIntersecting||this.loading||this.hasImpressionSent||this.sendImpressionEvent()})},{threshold:.1}),this.intersectionObserver.observe(this)}cleanupIntersectionObserver(){this.intersectionObserver&&(this.intersectionObserver.disconnect(),this.intersectionObserver=void 0)}sendImpressionEvent(){this.name&&!this.hasImpressionSent&&this.walletRank&&(this.hasImpressionSent=!0,(this.rdnsId||this.name)&&F.E.sendWalletImpressionEvent({name:this.name,walletRank:this.walletRank,rdnsId:this.rdnsId,view:l.I.state.view,displayIndex:this.displayIndex}))}render(){return(0,d.qy)`
      <wui-list-wallet
        .walletImages=${this.walletImages}
        imageSrc=${(0,f.J)(this.imageSrc)}
        name=${this.name}
        size=${(0,f.J)(this.size)}
        tagLabel=${(0,f.J)(this.tagLabel)}
        .tagVariant=${this.tagVariant}
        .walletIcon=${this.walletIcon}
        .tabIdx=${this.tabIdx}
        .disabled=${this.disabled}
        .showAllWallets=${this.showAllWallets}
        .loading=${this.loading}
        loadingSpinnerColor=${this.loadingSpinnerColor}
      ></wui-list-wallet>
    `}};aV.styles=aT,aU([(0,e.MZ)({type:Array})],aV.prototype,"walletImages",void 0),aU([(0,e.MZ)()],aV.prototype,"imageSrc",void 0),aU([(0,e.MZ)()],aV.prototype,"name",void 0),aU([(0,e.MZ)()],aV.prototype,"size",void 0),aU([(0,e.MZ)()],aV.prototype,"tagLabel",void 0),aU([(0,e.MZ)()],aV.prototype,"tagVariant",void 0),aU([(0,e.MZ)()],aV.prototype,"walletIcon",void 0),aU([(0,e.MZ)()],aV.prototype,"tabIdx",void 0),aU([(0,e.MZ)({type:Boolean})],aV.prototype,"disabled",void 0),aU([(0,e.MZ)({type:Boolean})],aV.prototype,"showAllWallets",void 0),aU([(0,e.MZ)({type:Boolean})],aV.prototype,"loading",void 0),aU([(0,e.MZ)({type:String})],aV.prototype,"loadingSpinnerColor",void 0),aU([(0,e.MZ)()],aV.prototype,"rdnsId",void 0),aU([(0,e.MZ)()],aV.prototype,"displayIndex",void 0),aU([(0,e.MZ)()],aV.prototype,"walletRank",void 0),aV=aU([(0,K.EM)("w3m-list-wallet")],aV);let aW=(0,K.AH)`
  :host {
    --local-duration-height: 0s;
    --local-duration: ${({durations:a})=>a.lg};
    --local-transition: ${({easings:a})=>a["ease-out-power-2"]};
  }

  .container {
    display: block;
    overflow: hidden;
    overflow: hidden;
    position: relative;
    height: var(--local-container-height);
    transition: height var(--local-duration-height) var(--local-transition);
    will-change: height, padding-bottom;
  }

  .container[data-mobile-fullscreen='true'] {
    overflow: scroll;
  }

  .page {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    width: 100%;
    height: auto;
    width: inherit;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    background-color: ${({tokens:a})=>a.theme.backgroundPrimary};
    border-bottom-left-radius: var(--local-border-bottom-radius);
    border-bottom-right-radius: var(--local-border-bottom-radius);
    transition: border-bottom-left-radius var(--local-duration) var(--local-transition);
  }

  .page[data-mobile-fullscreen='true'] {
    height: 100%;
  }

  .page-content {
    display: flex;
    flex-direction: column;
    min-height: 100%;
  }

  .footer {
    height: var(--apkt-footer-height);
  }

  div.page[view-direction^='prev-'] .page-content {
    animation:
      slide-left-out var(--local-duration) forwards var(--local-transition),
      slide-left-in var(--local-duration) forwards var(--local-transition);
    animation-delay: 0ms, var(--local-duration, ${({durations:a})=>a.lg});
  }

  div.page[view-direction^='next-'] .page-content {
    animation:
      slide-right-out var(--local-duration) forwards var(--local-transition),
      slide-right-in var(--local-duration) forwards var(--local-transition);
    animation-delay: 0ms, var(--local-duration, ${({durations:a})=>a.lg});
  }

  @keyframes slide-left-out {
    from {
      transform: translateX(0px) scale(1);
      opacity: 1;
      filter: blur(0px);
    }
    to {
      transform: translateX(8px) scale(0.99);
      opacity: 0;
      filter: blur(4px);
    }
  }

  @keyframes slide-left-in {
    from {
      transform: translateX(-8px) scale(0.99);
      opacity: 0;
      filter: blur(4px);
    }
    to {
      transform: translateX(0) translateY(0) scale(1);
      opacity: 1;
      filter: blur(0px);
    }
  }

  @keyframes slide-right-out {
    from {
      transform: translateX(0px) scale(1);
      opacity: 1;
      filter: blur(0px);
    }
    to {
      transform: translateX(-8px) scale(0.99);
      opacity: 0;
      filter: blur(4px);
    }
  }

  @keyframes slide-right-in {
    from {
      transform: translateX(8px) scale(0.99);
      opacity: 0;
      filter: blur(4px);
    }
    to {
      transform: translateX(0) translateY(0) scale(1);
      opacity: 1;
      filter: blur(0px);
    }
  }
`;var aX=function(a,b,c,d){var e,f=arguments.length,g=f<3?b:null===d?d=Object.getOwnPropertyDescriptor(b,c):d;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)g=Reflect.decorate(a,b,c,d);else for(var h=a.length-1;h>=0;h--)(e=a[h])&&(g=(f<3?e(g):f>3?e(b,c,g):e(b,c))||g);return f>3&&g&&Object.defineProperty(b,c,g),g};let aY=class extends d.WF{constructor(){super(...arguments),this.resizeObserver=void 0,this.transitionDuration="0.15s",this.transitionFunction="",this.history="",this.view="",this.setView=void 0,this.viewDirection="",this.historyState="",this.previousHeight="0px",this.mobileFullScreen=g.H.state.enableMobileFullScreen,this.onViewportResize=()=>{this.updateContainerHeight()}}updated(a){if(a.has("history")){let a=this.history;""!==this.historyState&&this.historyState!==a&&this.onViewChange(a)}a.has("transitionDuration")&&this.style.setProperty("--local-duration",this.transitionDuration),a.has("transitionFunction")&&this.style.setProperty("--local-transition",this.transitionFunction)}firstUpdated(){this.transitionFunction&&this.style.setProperty("--local-transition",this.transitionFunction),this.style.setProperty("--local-duration",this.transitionDuration),this.historyState=this.history,this.resizeObserver=new ResizeObserver(a=>{for(let b of a)if(b.target===this.getWrapper()){let a=b.contentRect.height,c=parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--apkt-footer-height")||"0");this.mobileFullScreen?(a=(window.visualViewport?.height||window.innerHeight)-this.getHeaderHeight()-c,this.style.setProperty("--local-border-bottom-radius","0px")):(a+=c,this.style.setProperty("--local-border-bottom-radius",c?"var(--apkt-borderRadius-5)":"0px")),this.style.setProperty("--local-container-height",`${a}px`),"0px"!==this.previousHeight&&this.style.setProperty("--local-duration-height",this.transitionDuration),this.previousHeight=`${a}px`}}),this.resizeObserver.observe(this.getWrapper()),this.updateContainerHeight(),window.addEventListener("resize",this.onViewportResize),window.visualViewport?.addEventListener("resize",this.onViewportResize)}disconnectedCallback(){let a=this.getWrapper();a&&this.resizeObserver&&this.resizeObserver.unobserve(a),window.removeEventListener("resize",this.onViewportResize),window.visualViewport?.removeEventListener("resize",this.onViewportResize)}render(){return(0,d.qy)`
      <div class="container" data-mobile-fullscreen="${(0,f.J)(this.mobileFullScreen)}">
        <div
          class="page"
          data-mobile-fullscreen="${(0,f.J)(this.mobileFullScreen)}"
          view-direction="${this.viewDirection}"
        >
          <div class="page-content">
            <slot></slot>
          </div>
        </div>
      </div>
    `}onViewChange(a){let b=a.split(",").filter(Boolean),c=this.historyState.split(",").filter(Boolean),d=c.length,e=b.length,f=b[b.length-1]||"",g=K.Zv.cssDurationToNumber(this.transitionDuration),h="";e>d?h="next":e<d?h="prev":e===d&&b[e-1]!==c[d-1]&&(h="next"),this.viewDirection=`${h}-${f}`,setTimeout(()=>{this.historyState=a,this.setView?.(f)},g),setTimeout(()=>{this.viewDirection=""},2*g)}getWrapper(){return this.shadowRoot?.querySelector("div.page")}updateContainerHeight(){let a=this.getWrapper();if(!a)return;let b=parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--apkt-footer-height")||"0"),c=0;this.mobileFullScreen?(c=(window.visualViewport?.height||window.innerHeight)-this.getHeaderHeight()-b,this.style.setProperty("--local-border-bottom-radius","0px")):(c=a.getBoundingClientRect().height+b,this.style.setProperty("--local-border-bottom-radius",b?"var(--apkt-borderRadius-5)":"0px")),this.style.setProperty("--local-container-height",`${c}px`),"0px"!==this.previousHeight&&this.style.setProperty("--local-duration-height",this.transitionDuration),this.previousHeight=`${c}px`}getHeaderHeight(){return 60}};aY.styles=[aW],aX([(0,e.MZ)({type:String})],aY.prototype,"transitionDuration",void 0),aX([(0,e.MZ)({type:String})],aY.prototype,"transitionFunction",void 0),aX([(0,e.MZ)({type:String})],aY.prototype,"history",void 0),aX([(0,e.MZ)({type:String})],aY.prototype,"view",void 0),aX([(0,e.MZ)({attribute:!1})],aY.prototype,"setView",void 0),aX([(0,e.wk)()],aY.prototype,"viewDirection",void 0),aX([(0,e.wk)()],aY.prototype,"historyState",void 0),aX([(0,e.wk)()],aY.prototype,"previousHeight",void 0),aX([(0,e.wk)()],aY.prototype,"mobileFullScreen",void 0),aY=aX([(0,K.EM)("w3m-router-container")],aY)}};