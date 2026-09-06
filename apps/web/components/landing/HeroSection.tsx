'use client';

interface HeroSectionProps {
  onOpenTrial: () => void;
}

export default function HeroSection({ onOpenTrial }: HeroSectionProps) {
  return (
    <section className="s_home-hero">
      <div className="s_container">
        <div className="s_row s_align-center">
          <div className="s_col-6">
            <div className="s_home-hero-left">
              <span className="s_home-hero-left-label">Tally Automation For Accountant</span>
              <h1>AI Accounting Automation Platform</h1>
              <p>
                Designed for <span>CAs</span> and <span>Tax professionals</span>
              </p>
              <ul>
                <li>
                  <span>
                    <svg
                      width="20px"
                      height="20px"
                      viewBox="0 0 30 30"
                      fill="#359766"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fill="#359766"
                        className="s_fill-1"
                        d="M30.004 15c0 1.28-1.573 2.335-1.888 3.515-.325 1.22.498 2.92-.12 3.988-.627 1.084-2.515 1.215-3.395 2.095-.88.88-1.01 2.767-2.095 3.395-1.067.617-2.767-.205-3.987.12-1.18.314-2.235 1.887-3.515 1.887-1.28 0-2.335-1.573-3.515-1.887-1.22-.325-2.92.497-3.988-.12-1.085-.628-1.215-2.515-2.095-3.395-.88-.88-2.767-1.01-3.395-2.095-.617-1.068.205-2.768-.12-3.988C1.576 17.335.004 16.28.004 15c0-1.28 1.572-2.335 1.887-3.515.325-1.22-.497-2.92.12-3.987.628-1.086 2.515-1.216 3.395-2.096.88-.88 1.01-2.767 2.095-3.395 1.068-.617 2.768.205 3.988-.12C12.669 1.573 13.724 0 15.004 0c1.28 0 2.335 1.573 3.515 1.887 1.22.325 2.92-.497 3.987.12 1.085.628 1.215 2.515 2.095 3.395.88.88 2.768 1.01 3.395 2.095.618 1.068-.205 2.768.12 3.988.315 1.18 1.888 2.235 1.888 3.515Z"
                      />
                      <path
                        fill="#fff"
                        className="s_fill-2"
                        d="m19.34 10.53-5.71 5.71-2.96-2.957a1.646 1.646 0 0 0-2.327 2.328l4.153 4.152c.625.625 1.64.625 2.265 0l6.905-6.905a1.646 1.646 0 0 0 0-2.327 1.643 1.643 0 0 0-2.325 0Z"
                      />
                    </svg>
                  </span>
                  <p className="s_flex-1">Data Entry Automation</p>
                </li>
                <li>
                  <span>
                    <svg
                      width="20px"
                      height="20px"
                      viewBox="0 0 30 30"
                      fill="#359766"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fill="#359766"
                        className="s_fill-1"
                        d="M30.004 15c0 1.28-1.573 2.335-1.888 3.515-.325 1.22.498 2.92-.12 3.988-.627 1.084-2.515 1.215-3.395 2.095-.88.88-1.01 2.767-2.095 3.395-1.067.617-2.767-.205-3.987.12-1.18.314-2.235 1.887-3.515 1.887-1.28 0-2.335-1.573-3.515-1.887-1.22-.325-2.92.497-3.988-.12-1.085-.628-1.215-2.515-2.095-3.395-.88-.88-2.767-1.01-3.395-2.095-.617-1.068.205-2.768-.12-3.988C1.576 17.335.004 16.28.004 15c0-1.28 1.572-2.335 1.887-3.515.325-1.22-.497-2.92.12-3.987.628-1.086 2.515-1.216 3.395-2.096.88-.88 1.01-2.767 2.095-3.395 1.068-.617 2.768.205 3.988-.12C12.669 1.573 13.724 0 15.004 0c1.28 0 2.335 1.573 3.515 1.887 1.22.325 2.92-.497 3.987.12 1.085.628 1.215 2.515 2.095 3.395.88.88 2.768 1.01 3.395 2.095.618 1.068-.205 2.768.12 3.988.315 1.18 1.888 2.235 1.888 3.515Z"
                      />
                      <path
                        fill="#fff"
                        className="s_fill-2"
                        d="m19.34 10.53-5.71 5.71-2.96-2.957a1.646 1.646 0 0 0-2.327 2.328l4.153 4.152c.625.625 1.64.625 2.265 0l6.905-6.905a1.646 1.646 0 0 0 0-2.327 1.643 1.643 0 0 0-2.325 0Z"
                      />
                    </svg>
                  </span>
                  <p className="s_flex-1">GST Automation</p>
                </li>
                <li>
                  <span>
                    <svg
                      width="20px"
                      height="20px"
                      viewBox="0 0 30 30"
                      fill="#359766"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fill="#359766"
                        className="s_fill-1"
                        d="M30.004 15c0 1.28-1.573 2.335-1.888 3.515-.325 1.22.498 2.92-.12 3.988-.627 1.084-2.515 1.215-3.395 2.095-.88.88-1.01 2.767-2.095 3.395-1.067.617-2.767-.205-3.987.12-1.18.314-2.235 1.887-3.515 1.887-1.28 0-2.335-1.573-3.515-1.887-1.22-.325-2.92.497-3.988-.12-1.085-.628-1.215-2.515-2.095-3.395-.88-.88-2.767-1.01-3.395-2.095-.617-1.068.205-2.768-.12-3.988C1.576 17.335.004 16.28.004 15c0-1.28 1.572-2.335 1.887-3.515.325-1.22-.497-2.92.12-3.987.628-1.086 2.515-1.216 3.395-2.096.88-.88 1.01-2.767 2.095-3.395 1.068-.617 2.768.205 3.988-.12C12.669 1.573 13.724 0 15.004 0c1.28 0 2.335 1.573 3.515 1.887 1.22.325 2.92-.497 3.987.12 1.085.628 1.215 2.515 2.095 3.395.88.88 2.768 1.01 3.395 2.095.618 1.068-.205 2.768.12 3.988.315 1.18 1.888 2.235 1.888 3.515Z"
                      />
                      <path
                        fill="#fff"
                        className="s_fill-2"
                        d="m19.34 10.53-5.71 5.71-2.96-2.957a1.646 1.646 0 0 0-2.327 2.328l4.153 4.152c.625.625 1.64.625 2.265 0l6.905-6.905a1.646 1.646 0 0 0 0-2.327 1.643 1.643 0 0 0-2.325 0Z"
                      />
                    </svg>
                  </span>
                  <p className="s_flex-1">
                    WhatsApp Automation<i>Coming Soon</i>
                  </p>
                </li>
              </ul>
              <div className="s_flex s_align-center s_home-hero-left-btn">
                <button
                  className="s_button"
                  type="button"
                  onClick={onOpenTrial}
                >
                  Start Free Trial
                </button>
              </div>
              <div className="s_flex s_flex-col s_home-hero-left-integrated">
                <p>Trusted By:</p>
                <div className="s_flex s_align-center gap-3">
                  <a target="_blank" rel="noopener noreferrer" href="https://cmpbenefits.icai.org/ac-automation-suvit-software/">
                    <img
                      alt="ICAI CMP"
                      loading="lazy"
                      width={120}
                      height={40}
                      className="s_w-full s_h-full"
                      src="https://static.taxone.vyapar.com/images/taxone/home/hero/trustedby/s_trustedby-1.webp"
                    />
                  </a>
                  <a target="_blank" rel="noopener noreferrer" href="https://www.aiftponline.org/home">
                    <img
                      alt="AIFTP"
                      loading="lazy"
                      width={120}
                      height={40}
                      className="s_w-full s_h-full"
                      src="https://static.taxone.vyapar.com/images/taxone/home/hero/trustedby/s_trustedby-2.webp"
                    />
                  </a>
                  <a target="_blank" rel="noopener noreferrer" href="https://bcasonline.org/friends-of-bcas/">
                    <img
                      alt="BCAS"
                      loading="lazy"
                      width={120}
                      height={40}
                      className="s_w-full s_h-full"
                      src="https://static.taxone.vyapar.com/images/taxone/home/hero/trustedby/s_trustedby-3.webp"
                    />
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div className="s_col-6">
            <div className="s_home-hero-right">
              <img
                alt="Vyapar TaxOne Platform Interface"
                loading="eager"
                width={560}
                height={400}
                className="s_w-full s_h-full drop-shadow-xl"
                src="https://static.taxone.vyapar.com/images/taxone/home/hero/s_hero.webp"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

