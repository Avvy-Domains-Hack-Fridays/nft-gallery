const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");

describe("Rental", function () {
  let contracts = {}
  let signers 
  let now
  let contractAddress
  let tokenId = '1'

  beforeEach(async () => {
    signers = await ethers.getSigners()
    now = parseInt(Date.now() / 1000)
    const Rental = await ethers.getContractFactory("Rental");
    contracts.rental = await Rental.deploy(now, 60 * 60)
    await contracts.rental.deployed()
    contractAddress = signers[2].address // value doesn't really matter here..
  })

  describe("Slots", function () {
    it('should allow slot creation', async () => {
      await contracts.rental.createSlot(ethers.utils.parseEther('1'))
      let slot = await contracts.rental.slots(0)
      expect(slot.id.toString()).to.equal('0')
      expect(slot.pricePerInterval.toString()).to.equal(ethers.utils.parseEther('1'))
      expect(slot.active).to.equal(true)
      await contracts.rental.createSlot(ethers.utils.parseEther('2'))
      slot = await contracts.rental.slots(1)
      expect(slot.id.toString()).to.equal('1')
      expect(slot.pricePerInterval.toString()).to.equal(ethers.utils.parseEther('2'))
      expect(slot.active).to.equal(true)
    })

    it('should allow slots to be updated', async () => {
      await contracts.rental.createSlot(ethers.utils.parseEther('1'))
      let slot = await contracts.rental.slots(0)
      expect(slot.id.toString()).to.equal('0')
      expect(slot.pricePerInterval.toString()).to.equal(ethers.utils.parseEther('1'))
      expect(slot.active).to.equal(true)
      await contracts.rental.updateSlot('0', ethers.utils.parseEther('2'), false)
      slot = await contracts.rental.slots(0)
      expect(slot.id.toString()).to.equal('0')
      expect(slot.pricePerInterval.toString()).to.equal(ethers.utils.parseEther('2'))
      expect(slot.active).to.equal(false)
    })

    it('should not allow non-owner to edit slots', async () => {
      await expect(
        contracts.rental.connect(signers[1]).createSlot(ethers.utils.parseEther('1'))
      ).to.be.reverted
    })
  });

  describe('Booking', function () {
    it('should allow booking a free slot', async () => {
      await contracts.rental.createSlot(ethers.utils.parseEther('0'))
      const out = await contracts.rental.book('0', contractAddress, tokenId, 1, 2)
    })

    it('should reject if the slot does not exist', async () => {
      await expect(contracts.rental.book('0', contractAddress, tokenId, 1, 2)).to.be.reverted
    })

    it('should reject if the slot is not active', async () => {
      const tx = await contracts.rental.createSlot(ethers.utils.parseEther('0'))
      const out = await tx.wait()
      const id = out.events[0].args.id
      await contracts.rental.updateSlot(id, '0', false)
      await expect(contracts.rental.book('0', contractAddress, tokenId, 1, 2)).to.be.reverted
    })

    it('should reject if the slot is booked', async () => {
      await contracts.rental.createSlot(ethers.utils.parseEther('0'))
      await contracts.rental.book('0', contractAddress, tokenId, 1, 2)
      await expect(contracts.rental.book('0', contractAddress, tokenId, 1, 2)).to.be.reverted
    })

    it('should reject if payment amount is not enough', async () => {
      await contracts.rental.createSlot(ethers.utils.parseEther('1'))
      await expect(contracts.rental.book('0', contractAddress, tokenId, 1, 2, {
        value: ethers.utils.parseEther('1')
      })).to.be.reverted
    })

    it('should fail is endOffset < startOffset', async () => {
      await contracts.rental.createSlot(ethers.utils.parseEther('0'))
      await expect(contracts.rental.book('0', contractAddress, tokenId, 1, 0)).to.be.reverted
    })

    it('should allow endOffset == startOffset', async () => {
      await contracts.rental.createSlot(ethers.utils.parseEther('0'))
      const out = await contracts.rental.book('0', contractAddress, tokenId, 1, 1)
    })

    it('should succeed if payment amount is enough', async () => {
      await contracts.rental.createSlot(ethers.utils.parseEther('1'))
      const tx = await contracts.rental.book('0', contractAddress, tokenId, 1, 2, {
        value: ethers.utils.parseEther('2')
      })
      const out = await tx.wait()
      expect(out.events[0].args.id).to.equal('0')
    })

    it('should allow non-owner to book', async () => {
      await contracts.rental.createSlot(ethers.utils.parseEther('1'))
      const tx = await contracts.rental.connect(signers[1]).book('0', contractAddress, tokenId, 1, 2, {
        value: ethers.utils.parseEther('2')
      })
      const out = await tx.wait()
      expect(out.events[0].args.id).to.equal('0')
    })

    it('should allow fetching booking details', async () => {
      let tx = await contracts.rental.createSlot(ethers.utils.parseEther('1'))
      let out = await tx.wait()
      const slotId = out.events[0].args.id
      tx = await contracts.rental.connect(signers[1]).book('0', contractAddress, tokenId, 1, 2, {
        value: ethers.utils.parseEther('2')
      })
      out = await tx.wait()
      const bookingId = out.events[0].args.id
      out = await contracts.rental.bookingLookups(slotId, 1)
      expect(out).to.equal(bookingId.add('1'))
      out = await contracts.rental.bookingLookups(slotId, 2)
      expect(out).to.equal(bookingId.add('1'))
    })
  })
});
