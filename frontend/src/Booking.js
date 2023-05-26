import NFTPreview from "./NFTPreview";
import { useState, useEffect } from "react";
import DatePicker from 'react-datepicker'

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
          <option selected={props.value === time ? 'selected' : ''} value={time}>{time}</option>
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
    goBack,
    selectedNFT,
    selectedSlot,
    setStep
  } = props
  const [activeNFT,setActiveNFT] = useState(0)
  const [bookedDays, setBookedDays] = useState(null)
  const [referenceOffset, setReferenceOffset] = useState(null)
  const [startDate, setStartDate] = useState(null)
  const [startTime, setStartTime] = useState('0:00')
  const [endDate, setEndDate] = useState(null)
  const [endTime, setEndTime] = useState('0:00')

  useEffect(() => {
    let active = true
    const run = async () => {
      const currentOffset = getCurrentOffset(bookingReferenceTime, bookingIntervalSize)
      // load bookings for next year
      const isBooked = await contract.isBooked(selectedSlot, currentOffset, currentOffset + 24 * 365)
      setReferenceOffset(currentOffset)
      setBookedDays(isBooked)
    }
    if (active) {
      run()
    }
    return () => {
      active = false
    }
  })

  const getEpoch = (date, time) => {
    const [hour, minutes] = time.split(':')
    return parseInt(Date.UTC(date.getFullYear(), date.getMonth(), date.getDay(), parseInt(hour), parseInt(minutes)) / 1000)
  }

  const validate = async () => {
    const startOffset = getOffset(getEpoch(startDate, startTime), bookingReferenceTime, bookingIntervalSize)
    const endOffset = getOffset(getEpoch(endDate, endTime), bookingReferenceTime, bookingIntervalSize)
    const diff = endOffset - startOffset
    if (diff < 1) {
      alert("You must book at least 1 hour")
      return
    }
    setStep(3)
  }

  return (
    <>
      <div className='cursor-pointer' onClick={goBack}>
        Choose another NFT
      </div>
      <div className='flex justify-between items-center flex-shrink-0'>
        <NFTPreview 
            nft={selectedNFT}
        />
        <div className='w-full'>
          <div>All times are in UTC</div>
           <div className='mt-4'>
              Start Date
              <DatePicker className='border border-gray-500 rounded' selected={startDate} onChange={(date) => setStartDate(date)} />
            </div>
            <div>
              Start Time
              <TimePicker value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            </div>
            <div className='mt-4'>
              End Date
              <DatePicker className='border border-gray-500 rounded' selected={endDate} onChange={(date) => setEndDate(date)} />
            </div>
            <div>
              End Time
              <TimePicker value={endTime} onChange={(e) => setEndTime(e.target.value)} />
           </div>
           <button className='bg-gray-100 mt-2 py-2 px-4 cursor-pointer' onClick={validate}>Validate</button>
        </div>
      </div>
    </>
  )
}

export default Booking;
