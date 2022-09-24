import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { UjjwalToken } from "../typechain-types";

describe("Ujjwal Token", () => {
    let token: UjjwalToken;
    let ownerAddress: string;
    let signer2: SignerWithAddress;
    let signer3: SignerWithAddress;
    let signer4: SignerWithAddress;

    before(async () => {
        const contract = await ethers.getContractFactory('UjjwalToken');
        token = await upgrades.deployProxy(contract, ['Ujjwal', 'UKG', '10000000000000000000000'], {
            initializer: 'initialize'
        }) as any;
        console.log('token deployed at', token.address);
        let signer1;
        [signer1, signer2, signer3, signer4] = await ethers.getSigners();
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
            const tx = token.mint(105);
            await expect(tx).to.emit(token, 'Transfer').withArgs(
                ethers.constants.AddressZero, ownerAddress, 105
            )

            //check for updated balance
            const balance = await token.balanceOf(ownerAddress);
            expect(balance).equal('10000000000000000000105');
            const totalSupply = await token.totalSupply();
            expect(balance).equal(totalSupply);
        })
    })

    describe('user test', () => {
        it('balance should be zero', async () => {
            const balance = await token.balanceOf(signer2.address);
            expect(balance).equal(0);
        })

        it('transfer from owner to user', async () => {
            const balanceOfOwnerBefore = await token.balanceOf(ownerAddress);
            const tx = token.transfer(signer2.address, 100);
            await expect(tx).to.emit(token, 'Transfer').withArgs(
                ownerAddress, signer2.address, 100
            );
            const balanceOfOwnerAfter = await token.balanceOf(ownerAddress);
            expect(balanceOfOwnerAfter).equal(balanceOfOwnerBefore.sub(100));

            const balanceOfUser = await token.balanceOf(signer2.address);
            expect(balanceOfUser).equal(100);
        })

        it('check allowance', async () => {
            const allowance = await token.allowance(signer2.address, signer3.address);
            expect(allowance).equal(0);
        })

        it('approve to user3 from user2', async () => {
            const tx = token.connect(signer2).approve(signer3.address, 50);
            await expect(tx).emit(token, 'Approval').withArgs(
                signer2.address, signer3.address, 50
            )

            const allowance = await token.allowance(signer2.address, signer3.address);
            expect(allowance).equal(50);
        })

        it('transfer from user3 to user4', async () => {
            const tx = token.connect(signer3).transferFrom(signer2.address, signer4.address, 10);
            await expect(tx).to.emit(token, 'Transfer').withArgs(
                signer2.address, signer4.address, 10
            );
            const allowance = await token.allowance(signer2.address, signer3.address);
            expect(allowance).equal(40);
        });



    });

    describe('prohibited', () => {

        it('initialize method again', async () => {
            const tx = token.initialize('Ujjwal', 'UKG', '1000');
            await expect(tx).to.be.revertedWith('Initializable: contract is already initialized')
        })

        it('mint token', async () => {
            const tx = token.connect(signer2).mint(105);
            await expect(tx).to.be.revertedWith('Ownable: caller is not the owner')
        })

        it('transfer from', async () => {
            const tx = token.transferFrom(ownerAddress, signer2.address, 100);
            await expect(tx).to.revertedWith('ERC20: insufficient allowance');
        })

        it('transfer from user3 to user4 more amount that allowance', async () => {
            const allowance = await token.allowance(signer2.address, signer3.address);
            expect(allowance).equal(40);
            const tx = token.connect(signer3).transferFrom(signer2.address, signer4.address, allowance + 1);
            await expect(tx).to.revertedWith('ERC20: insufficient allowance');
        });
    })



});