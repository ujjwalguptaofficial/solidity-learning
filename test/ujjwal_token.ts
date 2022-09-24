import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { UjjwalToken } from "../typechain-types";

describe("Ujjwal Token", () => {
    let token: UjjwalToken;
    let ownerAddress: string;
    before(async () => {
        const contract = await ethers.getContractFactory('UjjwalToken');
        token = await upgrades.deployProxy(contract, ['Ujjwal', 'UKG', '10000000000000000000000'], {
            initializer: 'initialize'
        }) as any;
        console.log('token deployed at', token.address);
        const [signer1, signer2] = await ethers.getSigners();
        ownerAddress = signer1.address;
    });

    describe('state', () => {
        it('check for token name', async () => {
            const name = await token.name();
            expect(name).equal('Ujjwal');
        })

        it('check for token symbol', async () => {
            const name = await token.symbol();
            expect(name).equal('UKG');
        })

        it('check token decimal', async () => {
            const decimals = await token.decimals();
            expect(decimals).equal(18);
        })

        it('total supply', async () => {
            const balance = await token.totalSupply();
            expect(balance).equal('10000000000000000000000');
        })
    })

    describe('owner', () => {
        it('check for owner', async () => {
            const owner = await token.owner();
            expect(owner).equal(ownerAddress);
        })

        it('balanceof owner', async () => {
            const balance = await token.balanceOf(ownerAddress);
            expect(balance).equal('10000000000000000000000');
        })

        it('should totalSupply equal to owner balance', async () => {
            const balance = await token.balanceOf(ownerAddress);
            const totalSupply = await token.totalSupply();
            expect(balance).equal(totalSupply);
        })

        it('mint token', async () => {
            const tx = await token.mint(105);
            expect(tx).to.emit(token, 'd');

            //check for updated balance
            const balance = await token.balanceOf(ownerAddress);
            expect(balance).equal('10000000000000000000105');
            const totalSupply = await token.totalSupply();
            expect(balance).equal(totalSupply);
        })
    })

});