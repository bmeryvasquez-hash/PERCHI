type ImageLightboxProps = {
  imageUrl: string;
  alt: string;
  onClose: () => void;
};

export default function ImageLightbox({ imageUrl, alt, onClose }: ImageLightboxProps) {
  return (
    <div className="lightbox-overlay" onClick={onClose} role="presentation">
      <div className="lightbox-dialog" onClick={event => event.stopPropagation()} role="dialog" aria-modal="true" aria-label={alt}>
        <button className="lightbox-close" type="button" onClick={onClose} aria-label="Cerrar imagen">×</button>
        <img className="lightbox-image" src={imageUrl} alt={alt} />
      </div>
    </div>
  );
}
