import React from 'react';

const Card = ({ title, emoji, description, link }) => {
  return (
    <div className="col-md-3 mb-3">
      <div className="card custom-card shadow-sm h-100">
        <div className="card-body text-center">
          <h5 className="card-title">{emoji} {title}</h5>
          <p className="card-text">{description}</p>
        </div>
        {/* Footer Section */}
        <div className="card-footer text-center">
          <a href={link} className="btn btn-primary custom-btn w-100">
            Explore
          </a>
        </div>
      </div>
    </div>
  );
};

export default Card;
