import NFTPreview from "./NFTPreview";
import { useState } from "react";

function UserNFTs(props) {
  const { nfts, address, selectedNFT, selectNFT, setStep } = props;
  const [activeNFT, setActiveNFT] = useState(0);

  const nextStep = () => {
    if (selectedNFT) setStep(2);
  };
  return (
    <div>
      {nfts.length > 0 ? (
        <div className="user-nfts">
          {nfts.map((nft, i) => {
            // if(i>3)return '';

            return (
              <NFTPreview
                key={i}
                nft={nft}
                onClick={(e) => {
                  setActiveNFT(i);
                  selectNFT(nft);
                }}
                active={activeNFT == i}
              />
            );
          })}
          <div>
            <button onClick={nextStep}>Next &gt;</button>
          </div>
        </div>
      ) : (
        <div>You don't seem to have any NFTs on [{address}]</div>
      )}
    </div>
  );
}

export default UserNFTs;
