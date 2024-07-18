import './TooltipImage.css';

function TooltipImage({ image, text, className }){
  return(
    <div className="tooltipimage">
      <img className={className} src={image}></img>
      <div className='tooltip'>
        {text}
      </div>
    </div>
  )
}

export default TooltipImage;
