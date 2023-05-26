
function NFTPreview(props) {
  const { nft, onClick, active } = props
  return (
    <div className={`user-nft ${active ? 'selected' : ''}`} onClick={onClick}>
      <div className="nft-image">
        <img
          alt={nft.name}
          height={160}
          placeholderSrc={`/img/default.PNG`}
          src={nft.image} // use normal <img> attributes as props
          width={160}
        />
      </div>
      <div className="nft-name">
        <div>{nft.name}</div>
        <div>
          <small>{nft.collectionName}</small>
        </div>
      </div>
    </div>
  )
}

export default NFTPreview
