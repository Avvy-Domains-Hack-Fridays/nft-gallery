import NFTPreview from './NFTPreview'
import { useState, useEffect } from 'react'
import DatePicker from 'react-datepicker'
import { ethers } from 'ethers'

function TimePicker(props) {
  const hours = []
  for (let i = 0; i < 24; i += 1) {
    hours.push(i)
  }
  return (
    <select onChange={props.onChange}>
      {hours.map((h) => {
        const time = `${h}:00` // this doesn't support the different refeerence times and interval sizes
        return (
          <option
            selected={props.value === time ? 'selected' : ''}
            value={time}
          >
            {time}
          </option>
        )
      })}
    </select>
  )
}

function Booking(props) {
  const {
    getOffset,
    getCurrentOffset,
    bookingReferenceTime,
    bookingIntervalSize,
    contract,
    viemContract,
    goBack,
    selectedNFT,
    selectedSlot,
    setStep,
  } = props
  const [activeNFT, setActiveNFT] = useState(0)
  const [bookedDays, setBookedDays] = useState(null)
  const [referenceOffset, setReferenceOffset] = useState(null)
  const [startDate, setStartDate] = useState(null)
  const [startTime, setStartTime] = useState('0:00')
  const [endDate, setEndDate] = useState(null)
  const [endTime, setEndTime] = useState('0:00')
  const [isPayment, setPayment] = useState(false)
  const [startOffset, setStartOffset] = useState(false)
  const [endOffset, setEndOffset] = useState(false)
  const [slot, setSlot] = useState(null)

  useEffect(() => {
    let active = true
    const run = async () => {
      const currentOffset = getCurrentOffset(
        bookingReferenceTime,
        bookingIntervalSize
      )
      // load bookings for next year
      const isBooked = await contract.isBooked(
        selectedSlot,
        currentOffset,
        currentOffset + 24 * 365
      )
      setReferenceOffset(currentOffset)
      setBookedDays(isBooked)
      
      // load slot data
      const slot = await contract.slots(selectedSlot)
      setSlot(slot)
    }
    if (active) {
      run()
    }
    return () => {
      active = false
    }
  })

  const pay = async () => {
    const amount = slot.pricePerInterval * window.BigInt(endOffset - startOffset + 1)

    try {
      await viemContract.write.book({
        args: [
          selectedSlot,
          selectedNFT.collectionContract,
          selectedNFT.tokenId,
          startOffset,
          endOffset
        ],
        value: amount
      })
    } catch (err) {
      alert('Failed to book space')
    }
  }

  const getEpoch = (date, time) => {
    const [hour, minutes] = time.split(':')
    return parseInt(
      Date.UTC(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        parseInt(hour),
        parseInt(minutes)
      ) / 1000
    )
  }

  const validate = async () => {
    if (!startDate || !startTime || !endDate || !endTime) {
      alert('You are missing data')
      return
    }
    const startOffset = getOffset(
      getEpoch(startDate, startTime),
      bookingReferenceTime,
      bookingIntervalSize
    )
    const endOffset = getOffset(
      getEpoch(endDate, endTime),
      bookingReferenceTime,
      bookingIntervalSize
    )
    const diff = endOffset - startOffset
    if (diff < 1) {
      alert('You must book at least 1 hour')
      return
    }
    setPayment(true)
    setStartOffset(startOffset)
    setEndOffset(endOffset)
  }

  return (
    <>
      <div className="cursor-pointer" onClick={goBack}>
        Choose another NFT
      </div>
      <div className="flex justify-between items-center flex-shrink-0">
        <NFTPreview nft={selectedNFT} />
        <div className="w-full">
          {isPayment ? (
            <>
              {endOffset - startOffset + 1} hours <br />
              @ {ethers.formatEther(slot.pricePerInterval.toString())} AVAX per hour <br />
              = {ethers.formatEther(slot.pricePerInterval * window.BigInt(endOffset - startOffset + 1))} AVAX
              <div className='mt-4'>
                <button className='bg-gray-100 py-2 px-4' onClick={() => setPayment(false)}>Go back</button>
                <button className='bg-gray-100 py-2 px-4' onClick={() => pay()}>Pay</button>
              </div>
            </>
          ) : (
            <>
              <div>All times are in UTC</div>
              <div className="mt-4">
                Start Date
                <DatePicker
                  className="border border-gray-500 rounded"
                  selected={startDate}
                  onChange={(date) => setStartDate(date)}
                />
              </div>
              <div>
                Start Time
                <TimePicker
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
              <div className="mt-4">
                End Date
                <DatePicker
                  className="border border-gray-500 rounded"
                  selected={endDate}
                  onChange={(date) => setEndDate(date)}
                />
              </div>
              <div>
                End Time
                <TimePicker
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
              <button
                className="bg-gray-100 mt-2 py-2 px-4 cursor-pointer"
                onClick={validate}
              >
                Validate
              </button>
            </>
          )}
        </div>
      </div>
    </>
  )
}

export default Booking
