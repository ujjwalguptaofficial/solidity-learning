// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.17;
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

// import "@openzeppelin/";

contract UjjwalToken is Initializable, OwnableUpgradeable, ERC20Upgradeable {
    function initialize(
        string memory name,
        string memory symbol,
        uint mintAmount
    ) public initializer {
        __ERC20_init(name, symbol);
        __Ownable_init();
        _mint(_msgSender(), mintAmount);
    }

    function mint(uint amount) external onlyOwner {
        _mint(_msgSender(), amount);
    }
}
