export default function ClientSlider() {
  const logos = Array.from({ length: 26 }, (_, i) => i + 1);

  return (
    <section className="s_clientslider py-12 overflow-hidden">
      <div className="s_container">
        <h6>
          More than <span>10,000+</span> practicing firms &amp; <span>30,000+</span> accountants are using our platform.
        </h6>
      </div>
      <div className="s_container-fluid">
        <div className="s_clientslider-inner">
          <ul className="s_clientslider-inner-list">
            {/* First sequence */}
            {logos.map((num) => (
              <li className="s_clientslider-inner-list-item" key={`first-${num}`}>
                <img
                  alt={`Trusted CA Firm ${num}`}
                  loading="lazy"
                  width={120}
                  height={48}
                  className="s_w-full s_h-full object-contain filter grayscale hover:grayscale-0 transition-all opacity-80 hover:opacity-100"
                  src={`https://static.taxone.vyapar.com/images/taxone/trusted/s_trusted-${num}.webp`}
                />
              </li>
            ))}
            {/* Duplicated sequence for seamless looping */}
            {logos.map((num) => (
              <li className="s_clientslider-inner-list-item" key={`second-${num}`}>
                <img
                  alt={`Trusted CA Firm ${num}`}
                  loading="lazy"
                  width={120}
                  height={48}
                  className="s_w-full s_h-full object-contain filter grayscale hover:grayscale-0 transition-all opacity-80 hover:opacity-100"
                  src={`https://static.taxone.vyapar.com/images/taxone/trusted/s_trusted-${num}.webp`}
                />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

