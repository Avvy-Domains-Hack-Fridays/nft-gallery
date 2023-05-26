import axios from "axios";
import { useEffect, useState } from "react";

export const Gallery = (props) => {
  const {openModal} = props;
  
  const [galleryNFTs,setGalleryNFTs] = useState([]);

  const fetchCurrentSlots = async () => {
    let currentSlots = [
      {
        contract_address: '0xFff2b395d039d4Eae7Afa4ED9946eD1c6f4A04B0',
        token_id: 105
      },
      null,
      {
        contract_address: '0xD8Dc8ef20Ef8E2aAF5f6ef43deC26c2CbF8A695F',
        token_id: 51
      },
      null,
      null
    ];

    return fetchNFTmetadata(currentSlots);
  }

  const fetchNFTmetadata = async (slots) => {
    let nfts = [];
    console.log(slots)
    for(let i=0;i<slots.length;i++){
      if(slots[i] !== null){
        // TODO: remove mock data, check glacier API or query from contract, unless we want to spill our joepegs api key :/
        
        slots[i].image = '/img/default.PNG';
        slots[i].name = 'test';

        nfts.push(slots[i])

        // axios
        // .get(`https://api.joepegs.dev/v3/collections/avalanche/${slots[i].contract_address}/tokens/${slots[i].token_id}`)
        // .then(response => {
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
      }else{
        nfts.push(null)
      }
      
    }
    console.log(nfts)
    setGalleryNFTs(nfts)
    return nfts;
  }

  useEffect(() => {

    (async () => {
      fetchCurrentSlots()
    })()
    
    }, []);

  return (
    <div className="container mx-auto px-5 py-2 lg:px-32 lg:pt-12">
      <div className="-m-1 flex flex-wrap md:-m-2">
        {galleryNFTs.map((slot,i) => {
          return slot == null ? (
            <div className="flex w-1/3 flex-wrap" key={i}>
              <div className="w-full p-1 md:p-2 text-center">
                <a href="#" onClick={(e) => {
                  e.preventDefault()
                  openModal(i)
                  }} className="relative inset-y-1/2">
                  Rent this space
                </a>
              </div>
            </div>
          ) : (
            <div className="flex w-1/3 flex-wrap" key={i}>
              <div className="w-full p-1 md:p-2" >
                <a href={`https://www.avalytics.xyz/collection/${slot.contract_address}/${slot.token_id}`} target="_blank">
                  <img
                    alt={slot.title}
                    className="block h-full w-full rounded-lg object-cover object-center"
                    src={slot.image} />
                </a>
              </div>
            </div>
          )
        })}
      </div>
    </div>
    
  );
};