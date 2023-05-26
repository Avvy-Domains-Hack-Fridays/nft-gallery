// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Rental is Ownable {
  event SlotCreated(uint id);
  event BookingCreated(uint id);
  
  struct Slot {
    uint id;
    uint pricePerInterval;
    bool active;
  }

  Slot[] public slots;
  uint lastSlotId;

  struct Booking {
    uint id;
    uint slot;
    address nftContract;
    uint tokenId;
    uint startOffset;
    uint endOffset;
    address booker;
  }
  uint lastBookingId;

  Booking[] public bookings;

  // Booking start & end times are offsets
  // of fixed-length time intervals from the
  // bookingReferenceTime.
  uint public immutable bookingReferenceTime;

  // bookingIntervalSize is the number of seconds
  // in one fixed-length time interval.
  uint public immutable bookingIntervalSize;

  // bookingLookups stores a map of which time
  // slots have been booked. The first level
  // key is the id of the slot we are looking at.
  // The second-level key is an offset of bookingIntervalSize units from
  // bookingReferenceTime. The value of the mapping
  // is the id of the booking that takes up that 
  // timeslot, but the id is incremented by 1.
  //
  // Why is the booking ID incremented by 1? We need to
  // reserve 0 for empty slots, but we also need to 
  // start booking & slot arrays from index 0, and we 
  // wanted to keep the IDs consistent with the array
  // slots.
  //
  // Consider the following example:
  //
  // 0 => 0
  // 1 => 0
  // 2 => 1338
  // 3 => 1338
  // 4 => 1338
  // 5 => 0
  // 6 => 0
  // 7 => 5318009
  //
  // Let's assume that bookingIntervalSize is 2 seconds.
  //
  // In this example, the first 4 seconds from
  // the bookingReferenceTime (indexes 0 and 1) are
  // empty. The following 6 seconds (indexes 2, 3, and 4)
  // are booked by booking ID 1337. The following 4 seconds
  // (indexes 5 & 6) are empty. The following 2 seconds
  // (index 7) is booked by booking ID 5318008.
  mapping(uint => mapping(uint => uint)) public bookingLookups;

  /* Required Methods
    - createSlot: create a new slot
    - updateSlot: update a slot's price
    - deleteSlot: delete a slot
    - getSlot: get a slot's data

    - get bookings for a slot ?
    - book function to book a slot 
  */

  function createSlot(uint pricePerInterval) public onlyOwner {
    slots.push(Slot({
      id: lastSlotId,
      pricePerInterval: pricePerInterval,
      active: true
    }));
    uint createdId = lastSlotId;
    lastSlotId++;
    emit SlotCreated(createdId);
  }

  function updateSlot(uint slotId, uint pricePerInterval, bool active) public onlyOwner {
    slots[slotId].pricePerInterval = pricePerInterval;
    slots[slotId].active = active;
  }

  /*
    startTime and endTime represent start & end offsets (inclusive)
    from the bookingReferenceTime, in time units of
    bookingIntervalSize
  */
  function book(
    uint slotId, 
    address nftContract, 
    uint tokenId, 
    uint startOffset, 
    uint endOffset
  ) public payable {
    Slot memory slot = slots[slotId];
    require(slot.active, "Rental: Slot is not active");
    require(endOffset >= startOffset, "Rental: Invalid booking range");

    // Any weird math bugs here?
    // - overflow is protected by solidity 0.8.
    // - endOffset must be larger than startOffset, so we have at least 0 for (endOffset - startOffset).
    uint cost = slot.pricePerInterval * ((endOffset - startOffset) + 1);
    require(msg.value >= cost, "Rental: Payment not sufficient");
    for (uint i = startOffset; i <= endOffset; i += 1) {
      require(bookingLookups[slotId][i] == 0, "Rental: Unavailable to book in that range");
    }
    bookings.push(Booking({
      id: lastBookingId,
      slot: slotId,
      nftContract: nftContract,
      tokenId: tokenId,
      startOffset: startOffset,
      endOffset: endOffset,
      booker: msg.sender
    }));
    uint createdId = lastBookingId;
    lastBookingId++;

    // We store bookingLookups with the booking ID incremented by 1
    for (uint i = startOffset; i <= endOffset; i += 1) {
      bookingLookups[slotId][i] = lastBookingId;
    }

    emit BookingCreated(createdId);
  }

  constructor(uint _bookingReferenceTime, uint _bookingIntervalSize) {
    bookingReferenceTime = _bookingReferenceTime;
    bookingIntervalSize = _bookingIntervalSize;
  }
}
