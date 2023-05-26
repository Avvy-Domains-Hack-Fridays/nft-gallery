import NFTPreview from "./NFTPreview";
import { useState, useEffect } from "react";

function Booking(props) {
  const {contract, goBack, selectedNFT, selectedSlot} = props
  const [activeNFT,setActiveNFT] = useState(0)

  

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
            
          </div>
        </div>
      </>
  )
}

export default Booking;
