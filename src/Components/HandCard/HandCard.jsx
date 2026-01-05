import "./HandCard.css";

export default function HandCard({ card, onClick, isSelected }) {
    return (
        <div
            className={`hand-card ${isSelected ? "selected" : ""}`}
            onClick={onClick}
        >
            <div className="card-background"/>
            <div className="stat cost-badge">{card.cost}</div>
            <div className="card-image-container">
                <img src={`${import.meta.env.BASE_URL}${card.image}`} alt={card.name} />
            </div>
            <div className="card-name">

                <svg width="128" height="176">
                    <path id="curve" d="m 10.580855,101.203
                                        c 0,0 21.736757,11.61594 41.863383,10.00581 20.126626,
                                        -1.61013 12.766032,-2.87524 32.777649,-0.11501 20.011613,
                                        2.76022 9.430762,6.2105 32.432623,3.33527"/>
                    <text className="text" textAnchor="middle">
                        <textPath className="text__path"
                                  href="#curve"
                                  startOffset="50%"
                        >{card.name}</textPath>
                    </text>
                </svg>

            </div>
            <div className="card-desc"> {card.description} </div>
            <div className="stat attack">{card.stats.attack}</div>
            <div className="stat health">{card.stats.health}</div>
        </div>
    );
}