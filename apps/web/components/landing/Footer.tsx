'use client';
import Link from 'next/link';

interface FooterProps {
  onOpenTrial: () => void;
}

export default function Footer({ onOpenTrial }: FooterProps) {
  return (
    <>
      <footer className="s_footer">
        <div className="s_container">
          {/* First row: Logo, Tagline, Social links */}
          <div className="s_row s_footer-first">
            <div className="s_col-12">
              <div className="s_footer-first-inner flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="s_footer-first-logo flex items-center gap-3">
                  <Link className="s_footer-logo s_ib" href="/">
                    <img
                      alt="Vyapar TaxOne Logo"
                      loading="lazy"
                      width={180}
                      height={40}
                      className="s_h-full s_w-full"
                      style={{ color: 'transparent', backgroundColor: 'transparent' }}
                      src="https://static.taxone.vyapar.com/images/taxone/logo/s_logo.svg"
                    />
                  </Link>
                  <span className="text-gray-400 text-sm">AI Weapon for Financial Soldiers</span>
                </div>

                <div className="s_footer-first-social flex items-center gap-2">
                  {/* YouTube */}
                  <a target="_blank" rel="noopener noreferrer" href="https://www.youtube.com/@Vyapar_TaxOne" title="YouTube">
                    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="14" cy="14" r="14" fill="#BB0000" />
                      <path
                        d="M21.3337 12.4743C21.3666 11.5201 21.158 10.573 20.727 9.72097C20.4346 9.37136 20.0288 9.13544 19.5803 9.0543C17.7254 8.88598 15.8627 8.817 14.0003 8.84763C12.1448 8.8156 10.2888 8.88237 8.44034 9.04763C8.07489 9.11411 7.73669 9.28553 7.46701 9.54097C6.86701 10.0943 6.80034 11.041 6.73368 11.841C6.63695 13.2793 6.63695 14.7226 6.73368 16.161C6.75296 16.6112 6.82001 17.0582 6.93368 17.4943C7.01406 17.831 7.17669 18.1425 7.40701 18.401C7.67852 18.6699 8.0246 18.8511 8.40034 18.921C9.83762 19.0984 11.2858 19.1719 12.7337 19.141C15.067 19.1743 17.1137 19.141 19.5337 18.9543C19.9186 18.8887 20.2745 18.7073 20.5537 18.4343C20.7403 18.2476 20.8797 18.019 20.9603 17.7676C21.1988 17.036 21.3159 16.2704 21.307 15.501C21.3337 15.1276 21.3337 12.8743 21.3337 12.4743ZM12.4937 15.901V11.7743L16.4403 13.8476C15.3337 14.461 13.8737 15.1543 12.4937 15.901Z"
                        fill="white"
                      />
                    </svg>
                  </a>

                  {/* LinkedIn */}
                  <a target="_blank" rel="noopener noreferrer" href="https://in.linkedin.com/company/vyapar-taxone" title="LinkedIn">
                    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="14" cy="14" r="14" fill="#336AEA" />
                      <path
                        d="M18.6667 8C19.0203 8 19.3594 8.14048 19.6095 8.39052C19.8595 8.64057 20 8.97971 20 9.33333V18.6667C20 19.0203 19.8595 19.3594 19.6095 19.6095C19.3594 19.8595 19.0203 20 18.6667 20H9.33333C8.97971 20 8.64057 19.8595 8.39052 19.6095C8.14048 19.3594 8 19.0203 8 18.6667V9.33333C8 8.97971 8.14048 8.64057 8.39052 8.39052C8.64057 8.14048 8.97971 8 9.33333 8H18.6667ZM18.3333 18.3333V14.8C18.3333 14.2236 18.1044 13.6708 17.6968 13.2632C17.2892 12.8556 16.7364 12.6267 16.16 12.6267C15.5933 12.6267 14.9333 12.9733 14.6133 13.4933V12.7533H12.7533V18.3333H14.6133V15.0467C14.6133 14.5333 15.0267 14.1133 15.54 14.1133C15.7875 14.1133 16.0249 14.2117 16.2 14.3867C16.375 14.5617 16.4733 14.7991 16.4733 15.0467V18.3333H18.3333ZM10.5867 11.7067C10.8837 11.7067 11.1686 11.5887 11.3786 11.3786C11.5887 11.1686 11.7067 10.8837 11.7067 10.5867C11.7067 9.96667 11.2067 9.46 10.5867 9.46C10.2879 9.46 10.0013 9.5787 9.78999 9.78999C9.5787 10.0013 9.46 10.2879 9.46 10.5867C9.46 11.2067 9.96667 11.7067 10.5867 11.7067ZM11.5133 18.3333V12.7533H9.66667V18.3333H11.5133Z"
                        fill="white"
                      />
                    </svg>
                  </a>

                  {/* X / Twitter */}
                  <a target="_blank" rel="noopener noreferrer" href="https://x.com/Vyapar_Taxone" title="X (Twitter)">
                    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="14" cy="14" r="14" fill="black" />
                      <path
                        d="M18.2375 8H20.2314L15.8764 12.9904L21 19.7813H16.9887L13.8468 15.6619L10.2514 19.7813H8.25675L12.9148 14.4431L8 8H12.1137L14.9534 11.7643L18.2375 8ZM17.5387 18.5853H18.6438L11.5124 9.13344H10.3278L17.5387 18.5853Z"
                        fill="white"
                      />
                    </svg>
                  </a>

                  {/* Instagram */}
                  <a target="_blank" rel="noopener noreferrer" href="https://www.instagram.com/vyapar_taxone/" title="Instagram">
                    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="14" cy="14" r="14" fill="#E1306C" />
                      <path
                        d="M13.9997 8.26127C15.8686 8.26127 16.0899 8.26827 16.8282 8.30194C17.2721 8.30737 17.7118 8.38888 18.1281 8.54293C18.4301 8.65937 18.7043 8.83774 18.9331 9.06657C19.1619 9.29539 19.3403 9.5696 19.4567 9.87153C19.6108 10.2879 19.6923 10.7276 19.6977 11.1715C19.7311 11.9098 19.7384 12.1311 19.7384 14C19.7384 15.8689 19.7314 16.0902 19.6977 16.8285C19.6923 17.2724 19.6108 17.7121 19.4567 18.1285C19.3403 18.4304 19.1619 18.7046 18.9331 18.9334C18.7043 19.1623 18.4301 19.3406 18.1281 19.4571C17.7118 19.6111 17.2721 19.6926 16.8282 19.6981C16.0902 19.7314 15.8689 19.7387 13.9997 19.7387C12.1304 19.7387 11.9091 19.7317 11.1711 19.6981C10.7272 19.6926 10.2875 19.6111 9.8712 19.4571C9.56926 19.3406 9.29506 19.1623 9.06624 18.9334C8.83741 18.7046 8.65904 18.4304 8.54259 18.1285C8.38855 17.7121 8.30704 17.2724 8.3016 16.8285C8.26827 16.0902 8.26094 15.8689 8.26094 14C8.26094 12.1311 8.26794 11.9098 8.3016 11.1715C8.30704 10.7276 8.38855 10.2879 8.54259 9.87153C8.65904 9.5696 8.83741 9.29539 9.06624 9.06657C9.29506 8.83774 9.56926 8.65937 9.8712 8.54293C10.2875 8.38888 10.7272 8.30737 11.1711 8.30194C11.9094 8.26861 12.1308 8.26127 13.9997 8.26127V8.26127ZM13.9997 7C12.0998 7 11.8604 7.008 11.1138 7.042C10.5328 7.05355 9.95806 7.16355 9.41389 7.36732C8.94707 7.5432 8.52426 7.81882 8.17494 8.17494C7.81849 8.52439 7.54264 8.94744 7.36665 9.41455C7.16289 9.95872 7.05289 10.5335 7.04133 11.1145C7.008 11.8604 7 12.0998 7 13.9997C7 15.8996 7.008 16.1389 7.042 16.8855C7.05355 17.4665 7.16355 18.0413 7.36732 18.5854C7.54311 19.0525 7.81874 19.4755 8.17494 19.8251C8.52445 20.1813 8.9475 20.4569 9.41455 20.6327C9.95873 20.8364 10.5335 20.9464 11.1145 20.958C11.8611 20.9913 12.0994 21 14.0003 21C15.9012 21 16.1396 20.992 16.8862 20.958C17.4672 20.9464 18.0419 20.8364 18.5861 20.6327C19.051 20.4525 19.4731 20.1773 19.8255 19.8247C20.1779 19.472 20.4528 19.0497 20.6327 18.5848C20.8365 18.0406 20.9464 17.4658 20.958 16.8849C20.9913 16.1389 20.9993 15.8996 20.9993 13.9997C20.9993 12.0998 20.9913 11.8604 20.9573 11.1138C20.9458 10.5328 20.8358 9.95806 20.632 9.41388C20.4562 8.94683 20.1806 8.52378 19.8244 8.17428C19.4749 7.81807 19.0518 7.54244 18.5848 7.36665C18.0406 7.16289 17.4658 7.05289 16.8849 7.04133C16.1389 7.008 15.8996 7 13.9997 7Z"
                        fill="white"
                      />
                      <circle cx="14" cy="14" r="3.5" fill="white" />
                      <circle cx="18" cy="10" r="0.8" fill="white" />
                    </svg>
                  </a>

                  {/* Facebook */}
                  <a target="_blank" rel="noopener noreferrer" href="https://www.facebook.com/taxone.vyapar" title="Facebook">
                    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="14" cy="14" r="14" fill="#1877F2" />
                      <path
                        d="M12.7087 20.3038V14.7503H10.8398V12.5859H12.7087V10.9898C12.7087 9.13752 13.84 8.12891 15.4924 8.12891C16.2839 8.12891 16.9642 8.18784 17.1624 8.21417V10.1499L16.0164 10.1505C15.1178 10.1505 14.9438 10.5775 14.9438 11.2041V12.5859H17.087L16.8079 14.7503H14.9438V20.3038H12.7087Z"
                        fill="white"
                      />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Second row: CTAs & Column Menus */}
          <div className="s_row s_footer-second">
            <div className="s_col-4">
              <h5>Experience the Power of Automation</h5>
              <div className="s_footer-second-button">
                <button
                  className="s_button"
                  type="button"
                  onClick={onOpenTrial}
                >
                  Start Free Trial
                </button>
              </div>
            </div>

            <div className="s_col-2">
              <h6>Product feature</h6>
              <ul className="s_footer-second-menu">
                <li>
                  <a href="#features">Data Entry Automation</a>
                </li>
                <li>
                  <a href="#features">GST Automation</a>
                </li>
                <li>
                  <a href="#oneplatform">Vyapar TaxOne Chat</a>
                </li>
              </ul>
            </div>

            <div className="s_col-2">
              <h6>Company</h6>
              <ul className="s_footer-second-menu">
                <li>
                  <a href="#about">About Us</a>
                </li>
                <li>
                  <a href="#ca">For CA</a>
                </li>
                <li>
                  <a href="#pricing" onClick={onOpenTrial}>
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#partner">Partner</a>
                </li>
                <li>
                  <a href="#career">Career</a>
                </li>
              </ul>
            </div>

            <div className="s_col-2">
              <h6>Resources</h6>
              <ul className="s_footer-second-menu">
                <li>
                  <a href="#blog">Blog</a>
                </li>
                <li>
                  <a href="#calculator">Calculators</a>
                </li>
                <li>
                  <a href="#webinars">Webinars</a>
                </li>
              </ul>
            </div>

            <div className="s_col-2">
              <h6>Help</h6>
              <ul className="s_footer-second-menu">
                <li>
                  <a href="#help">Help Center</a>
                </li>
                <li>
                  <a href="#contact">Customer Support</a>
                </li>
                <li>
                  <a href="#refund">Refund &amp; Cancellation</a>
                </li>
                <li>
                  <a href="#terms">Terms &amp; Conditions</a>
                </li>
                <li>
                  <a href="#privacy">Privacy Policy</a>
                </li>
              </ul>
            </div>
          </div>

          {/* Third row: Address, Phone, Support Email */}
          <div className="s_row s_footer-third">
            <div className="s_col-4">
              <h6>
                <svg width="20px" height="20px" viewBox="0 0 18 21" fill="#1C1F27" xmlns="http://www.w3.org/2000/svg" className="s_mr-5 inline-block mr-1.5">
                  <path
                    fill="#1C1F27"
                    className="s_fill"
                    d="M15 2.48a8.485 8.485 0 0 0-12 12l5.27 5.28a1 1 0 0 0 1.42 0L15 14.43a8.45 8.45 0 0 0 0-11.95ZM13.57 13 9 17.59 4.43 13a6.46 6.46 0 1 1 9.14 0ZM6 5.41a4.32 4.32 0 0 0 0 6.1 4.31 4.31 0 0 0 7.36-3 4.24 4.24 0 0 0-1.26-3.05A4.3 4.3 0 0 0 6 5.41Zm4.69 4.68a2.33 2.33 0 1 1 .67-1.63 2.33 2.33 0 0 1-.72 1.63h.05Z"
                  />
                </svg>{' '}
                Address
              </h6>
              <ul className="s_footer-third-menu">
                <li>
                  <a target="_blank" rel="noopener noreferrer" href="https://maps.app.goo.gl/AbbRmAcY3NvxAUK26">
                    9th Floor, Infinity Tower, Lal Darwaja Station Road, Beside Ayurvedic College, Surat, Gujarat - 395003
                  </a>
                </li>
              </ul>
            </div>

            <div className="s_col-4">
              <h6>
                <svg width="18px" height="18px" viewBox="0 0 21 21" fill="#1C1F27" xmlns="http://www.w3.org/2000/svg" className="s_mr-5 inline-block mr-1.5">
                  <path
                    fill="#1C1F27"
                    className="s_fill"
                    d="M19.469 7.5a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm-3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm-3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm4.44 4c-.22 0-.45-.07-.67-.12a9.443 9.443 0 0 1-1.31-.39 2 2 0 0 0-2.48 1l-.22.45a12.483 12.483 0 0 1-2.67-2 12.832 12.832 0 0 1-2-2.66l.44-.28a2 2 0 0 0 1-2.48 10.33 10.33 0 0 1-.39-1.31c-.05-.23-.09-.45-.12-.68a3 3 0 0 0-3-2.49h-3a3 3 0 0 0-2.24 1 3 3 0 0 0-.73 2.39 19 19 0 0 0 16.48 16.48c.13.01.26.01.39 0a3 3 0 0 0 3-3v-3a3 3 0 0 0-2.48-2.91Zm.49 6a.999.999 0 0 1-1.15 1 17.12 17.12 0 0 1-9.87-4.85 17.14 17.14 0 0 1-4.84-9.93 1 1 0 0 1 .25-.82 1 1 0 0 1 .74-.34h3a1 1 0 0 1 1 .79c.04.273.09.543.15.81.115.527.269 1.045.46 1.55l-1.4.65a1 1 0 0 0-.49 1.33 14.49 14.49 0 0 0 7 7 1 1 0 0 0 .76 0 1 1 0 0 0 .56-.52l.63-1.4c.517.184 1.044.338 1.58.46.26.06.54.11.81.15a1 1 0 0 1 .78 1l.03 3.12Z"
                  />
                </svg>{' '}
                Phone
              </h6>
              <ul className="s_footer-third-menu">
                <li>
                  <a href="tel:+919558261955">+91 9558261955</a>
                  <br />
                  <p className="text-xs text-gray-500 mt-1">9:00 AM to 7:00 PM (Monday to Saturday)</p>
                </li>
              </ul>
            </div>

            <div className="s_col-4">
              <h6>
                <svg width="18px" height="18px" viewBox="0 0 20 17" fill="#1C1F27" xmlns="http://www.w3.org/2000/svg" className="s_mr-5 inline-block mr-1.5">
                  <path
                    fill="#1C1F27"
                    className="s_fill"
                    d="M17 .5H3a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3v-10a3 3 0 0 0-3-3Zm-.41 2-5.88 5.88a1 1 0 0 1-1.42 0L3.41 2.5h13.18Zm1.41 11a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.91l5.88 5.88a3 3 0 0 0 4.24 0L18 3.91v9.59Z"
                  />
                </svg>{' '}
                Support Email
              </h6>
              <ul className="s_footer-third-menu">
                <li>
                  <a href="mailto:taxonesupport@vyapar.com">taxonesupport@vyapar.com</a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Sticky Mobile CTA Button */}
      <button
        className="s_button s_full-sticky-btn md:hidden fixed bottom-4 right-4 left-4 z-50 shadow-2xl py-3 rounded-xl text-center font-bold"
        type="button"
        onClick={onOpenTrial}
      >
        Start 7 Days Free Trial
      </button>
    </>
  );
}

