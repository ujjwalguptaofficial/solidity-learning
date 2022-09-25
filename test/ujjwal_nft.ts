import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers, upgrades } from "hardhat"
import { UjjwalNFT } from "../typechain-types";

describe("ujjwal NFT", () => {
    let signer1: SignerWithAddress,
        signer2: SignerWithAddress,
        signer3: SignerWithAddress;
    let nft: UjjwalNFT;
    before(async () => {
        [signer1, signer2, signer3] = await ethers.getSigners();
        const ct = await ethers.getContractFactory('UjjwalNFT');
        nft = await upgrades.deployProxy(ct, ['UjjwalNFT', 'UNFT', 'https://ujjwalnft.com/metadata/'], {
            initializer: 'initialize',
        }) as any;
        await nft.deployed();
    })

    describe('estimate gas', () => {
        it('mint', async () => {
            const value = await nft.estimateGas.mint()
            expect(value).equal(99090);
        })

        it('setBaseTokenURI', async () => {
            const value = await nft.estimateGas.setBaseTokenURI('https://ujjwalnft.com/metadata/')
            expect(value).equal(37231);
        })

        it('_baseURI', async () => {
            const value = await nft.estimateGas.baseTokenURI()
            expect(value).equal(32136);
        })
    })

    describe('owner', () => {
        it('owner address', async () => {
            const ownerAddress = await nft.owner();
            expect(ownerAddress).equal(signer1.address);
        })
    })

    describe('public state', () => {
        it('name', async () => {
            const value = await nft.name();
            expect(value).equal('UjjwalNFT');
        })

        it('symbol', async () => {
            const value = await nft.symbol();
            expect(value).equal('UNFT');
        })

        it('baseTokenURI', async () => {
            const value = await nft.baseTokenURI();
            expect(value).equal('https://ujjwalnft.com/metadata/');
        })
    })

    describe('users method', () => {
        it('mint', async () => {
            const tx = nft.mint();
            await expect(tx).emit(nft, 'Transfer').withArgs(
                ethers.constants.AddressZero, signer1.address, 1
            );
        })

        it('balance of', async () => {
            let balance = await nft.balanceOf(signer1.address);
            expect(balance).equal(1);

            balance = await nft.balanceOf(signer2.address);
            expect(balance).equal(0);
        });

        it('tokenURI', async () => {
            const value = await nft.tokenURI(1);
            expect(value).equal('https://ujjwalnft.com/metadata/1');
        })
    })

    describe('reverted', () => {
        it('initialized should revert', async () => {
            const tx = nft.initialize('UjjwalNFT', 'UNFT', 'https://ujjwalnft.com/metadata');
            await expect(tx).to.be.revertedWith('Initializable: contract is already initialized')
        })

        it('transfer to zero address should be reverted', async () => {
            const tx = nft.transferFrom(signer1.address, ethers.constants.AddressZero, 1);
            await expect(tx).to.be.revertedWith('ERC721: transfer to the zero address')
        })

        it('transfer from incorrect owner should be reverted', async () => {
            const tx = nft.transferFrom(signer2.address, ethers.constants.AddressZero, 1);
            await expect(tx).to.be.revertedWith('ERC721: transfer from incorrect owner')
        })

        it('setBaseTokenURI not by owner', async () => {
            const tx = nft.connect(signer2).setBaseTokenURI('https://ujjwalnft.com/metadata/')
            await expect(tx).to.be.revertedWith('Ownable: caller is not the owner')
        })
    })


})