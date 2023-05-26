import axios from 'axios'
import { useEffect, useState } from 'react'
import { ethers } from 'ethers'

export const Gallery = (props) => {
  const { openModal, owner, address, contract, viemContract, getCurrentOffset, bookingReferenceTime } = props

  const [galleryNFTs, setGalleryNFTs] = useState([])

  const fetchCurrentSlots = async () => {
    const currentOffset = getCurrentOffset()
    if (isNaN(currentOffset)) return // has not loaded yet.
    const bookings = await contract.getBookingsAtOffset(currentOffset)

    // assemble bookings data
    let slotBookings = []
    for (let i = 0; i < bookings.bookers.length; i += 1) {
      slotBookings.push({
        hasBooking: bookings.hasBooking[i],
        bookingId: bookings.bookingIds[i],
        nftContract: bookings.nftContracts[i],
        tokenId: bookings.tokenIds[i],
        booker: bookings.bookers[i]
      })
    }

    return fetchNFTmetadata(slotBookings.map(b => {
      if (b.hasBooking) return b
      return null
    }))

    /*
    let currentSlots = [
      {
        contract_address: '0xFff2b395d039d4Eae7Afa4ED9946eD1c6f4A04B0',
        token_id: 105,
      },
      null,
      {
        contract_address: '0xD8Dc8ef20Ef8E2aAF5f6ef43deC26c2CbF8A695F',
        token_id: 51,
      },
      null,
      null,
    ]

    return fetchNFTmetadata(currentSlots)
    */
  }

  const fetchNFTmetadata = async (slots) => {
    let nfts = []
    console.log(slots)
    for (let i = 0; i < slots.length; i++) {
      if (slots[i] !== null) {
        // TODO: remove mock data, check glacier API or query from contract, unless we want to spill our joepegs api key :/

        slots[i].image = '/img/default.PNG'
        slots[i].name = 'test'

        nfts.push(slots[i])
        // const config = {
        //   headers:{
        //     'x-joepegs-api-key': process.env.JOEPEGS_API_KEY
        //   }
        // };
        // axios
        // .get(`https://api.joepegs.dev/v3/collections/avalanche/${slots[i].contract_address}/tokens/${slots[i].token_id}`,config)
        // .then(response => {
        //   console.log(response)
        //   const data = response?.data?.data
        //   if(data.length>0){
        //     slots[i].image = data.metadata.image;
        //     slots[i].title = data.metada.name;
        //     nfts.push(slots[i])
        //   }else{
        //     nfts.push(null)
        //   }
        // }).catch(function(error) {
        //   console.log(error);
        // });
      } else {
        nfts.push(null)
      }
    }
    console.log(nfts)
    setGalleryNFTs(nfts)
    return nfts
  }

  useEffect(() => {
    ;(async () => {
      fetchCurrentSlots()
    })()
  }, [bookingReferenceTime])

  const addSlot = async () => {
    let cost = prompt('How much AVAX should the slot cost per hour?')
    let avax = ethers.parseEther(cost)
    try {
      await viemContract.write.createSlot([avax])
    } catch (err) {
      alert('Failed to add slot')
    }
  }

  return (
    <div className="container mx-auto px-5 py-2 lg:px-32 lg:pt-12">
      <div className="-m-1 flex flex-wrap md:-m-2">
        {galleryNFTs.map((slot, i) => {
          return slot == null ? (
            <div className="flex w-1/3 flex-wrap" key={i}>
              <div className="w-full p-1 md:p-2 text-center">
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    openModal(i)
                  }}
                  className="relative inset-y-1/2"
                >
                  Rent this space
                </a>
              </div>
            </div>
          ) : (
            <div className="flex w-1/3 flex-wrap" key={i}>
              <div className="w-full p-1 md:p-2">
                <a
                  href={`https://www.avalytics.xyz/collection/${slot.contract_address}/${slot.token_id}`}
                  target="_blank"
                >
                  <img
                    alt={slot.title}
                    className="block h-full w-full rounded-lg object-cover object-center"
                    src={slot.image}
                  />
                </a>
              </div>
            </div>
          )
        })}
      </div>
      {owner === address ? (
        <div className='cursor-pointer mt-8 text-center w-full' onClick={addSlot}>{'As an owner, you can add a new slot'}</div>
      ) : null}
    </div>
  )
}
