import axios from 'axios'
import Utils from './Utils.js'
import { useState, useEffect } from 'react'

function NFTPreview(props) {
  const { nft, onClick, active } = props
  const [image, setImage] = useState(null)
  const [name, setName] = useState(null)
  const [collectionName, setCollectionName] = useState(null)

  useEffect(() => {
    let running = false
    const run = async () => {
      let res
      if ((!name || !image || !collectionName) 
          && (!nft.name || !nft.image || !nft.collectionName)) {
        res = await axios.get(nft.tokenUri)
      }
      if (!image) {
        if (nft.image) {
          setImage(nft.image)
        } else {
          setImage(res.data.image)
        }
      }
      if (!name) {
        if (nft.collectionName === 'Avvy Domains') {
        } else if (nft.name) {
          setName(nft.name)
        } else {
          setName(res.data.name)
        }
      }
      if (!collectionName) {
        if (nft.collectionName) {
          setCollectionName(nft.collectionName)
        }
      }
    }
    if (!running) {
      run()
    }
    return () => {
      running = true
    }
  })
  return (
    <div className={`user-nft ${active ? 'selected' : ''}`} onClick={onClick}>
      <div className="nft-image">
        <img
          alt={name}
          height={160}
          placeholderSrc={`/img/default.PNG`}
          src={image} // use normal <img> attributes as props
          width={160}
        />
      </div>
      <div className="nft-name">
        <div>{name}</div>
        <div>
          <small>{collectionName}</small>
        </div>
      </div>
    </div>
  )
}

export default NFTPreview
