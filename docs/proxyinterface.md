## Proxy Interface

interface need to be implementing in implementation smart contract which is the smart contract that need to be calling by the proxy contract

#### Gas Price Oralce Interface
---

``` solidity
interface IGasPriceOracle {
    function status() external view returns (bool);
    function version() external view returns (uint256);
    function calculate(uint256 gasUsed) external view returns (uint256);
}
```

`function status() external view returns (bool);`  
return: `true` if smart contract enable, `false` if smart contract disable.

`function version() external view returns (uint256);`  
return: version of the smart contract for example `10000` is mean `1.00.00`

`function calculate(uint256 gasUsed) external view returns (uint256);`  
parameter:  `gaslimit` or `gasUsed`  
return: calculated cost of transaction.

#### Service Provider Interface
---

view function
``` solidity
interface IServiceProvider {
    function version() external view returns (uint256);
    function getServiceProvider(
        address merchant
    ) external view returns (address);
    function grantMerchant(address merchant, address callee) external;
    function revokeMerchant(address merchant, address callee) external;
}
```

`function version() external view returns (uint256);`  
return: version of the smart contract for example `10000` is mean `1.00.00`

`function getServiceProvider(address merchant) external view returns (address);`  
return: service provide who onboarded merchant.