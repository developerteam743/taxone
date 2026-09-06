'use client';
import { useState } from 'react';
import Link from 'next/link';

interface NavbarProps {
  onOpenTrial: () => void;
}

export default function Navbar({ onOpenTrial }: NavbarProps) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header className="s_header">
        <div className="s_container">
          <div className="s_header-inner">
            <Link className="s_header-logo s_ib" href="/">
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

            <div className={mobileOpen ? 's_mobile-menu open' : 'false'}>
              <ul className="s_header-menu">
                {/* Features Dropdown */}
                <li
                  className={activeMenu === 'features' ? 's_active' : ''}
                  onMouseEnter={() => setActiveMenu('features')}
                  onMouseLeave={() => setActiveMenu(null)}
                >
                  <span
                    className="s_flex s_align-center s_cp"
                    onClick={() => setActiveMenu(activeMenu === 'features' ? null : 'features')}
                  >
                    Features{' '}
                    <svg
                      width="14px"
                      height="7px"
                      viewBox="0 0 15 8"
                      fill="#383E4E"
                      xmlns="http://www.w3.org/2000/svg"
                      className="s_menu-icon"
                    >
                      <path
                        fill="#383E4E"
                        className="s_fill"
                        d="M7.504 8a2.272 2.272 0 0 1-1.608-.666L.463 1.9a.629.629 0 0 1 0-.884.629.629 0 0 1 .883 0l5.433 5.434c.4.4 1.05.4 1.45 0l5.434-5.434a.629.629 0 0 1 .883 0 .629.629 0 0 1 0 .884L9.113 7.334A2.272 2.272 0 0 1 7.504 8Z"
                      />
                    </svg>
                  </span>
                  <div className="s_header-dropdown">
                    <div className="s_container">
                      <div className="s_row s_align-center">
                        <div className="s_col-12">
                          <h4>Features</h4>
                        </div>
                        <div className="s_col-4">
                          <a className="s_flex" href="#features" onClick={() => setActiveMenu(null)}>
                            <div className="s_flex s_align-center s_content-center s_header-dropdown-bigicon">
                              <svg width="36px" height="36px" viewBox="0 0 23 24" fill="#ED1A3B" xmlns="http://www.w3.org/2000/svg">
                                <path
                                  className="s_fill"
                                  fill="#ED1A3B"
                                  d="M11 23a1 1 0 0 1-1 1H5c-2.757 0-5-2.243-5-5V5.001A5.006 5.006 0 0 1 4.999 0H15c2.757 0 5 2.242 5 4.999v5a1 1 0 1 1-2 0v-5c0-1.654-1.346-3-3-3H4.999c-1.654 0-3 1.347-3 3.001v13.999c0 1.654 1.346 3 3 3h5a1 1 0 0 1 1 1L11 23ZM7 5H5a1 1 0 1 0 0 2h2a1 1 0 1 0 0-2Zm0 10H5a1 1 0 1 0 0 2h2a1 1 0 1 0 0-2Zm4-10a1 1 0 1 0 0 2h4a1 1 0 1 0 0-2h-4Zm-4 5H5a1 1 0 1 0 0 2h2a1 1 0 1 0 0-2Z"
                                />
                                <path
                                  className="s_fill"
                                  fill="#ED1A3B"
                                  d="M10 11a1 1 0 0 1 1-1h4a1 1 0 1 1 0 2h-4a1 1 0 0 1-1-1ZM12.004 15.267c1.895-2.21 5.29-2.486 7.568-.615l.71.582-.18-1.618a.871.871 0 0 1 .81-.944.898.898 0 0 1 .974.799l.302 2.914c.084.899-.596 1.69-1.514 1.764l-3.01.244a.898.898 0 0 1-.974-.8.871.871 0 0 1 .81-.944l1.577-.128-.65-.534c-1.52-1.247-3.782-1.063-5.046.41-1.264 1.473-1.056 3.685.463 4.932 1.519 1.247 3.781 1.063 5.045-.41a3.43 3.43 0 0 0 .405-.58.902.902 0 0 1 1.213-.345.873.873 0 0 1 .363 1.189c-.17.306-.373.598-.604.867-1.895 2.21-5.29 2.485-7.568.615-2.278-1.87-2.59-5.189-.694-7.398Z"
                                />
                              </svg>
                            </div>
                            <div className="s_flex-1">
                              <h6>Data Entry Automation</h6>
                              <p>Send accurate data to accounting software: Excel, PDF supported.</p>
                            </div>
                          </a>
                        </div>
                        <div className="s_col-4">
                          <a className="s_flex" href="#features" onClick={() => setActiveMenu(null)}>
                            <div className="s_flex s_align-center s_content-center s_header-dropdown-bigicon">
                              <svg width="36px" height="36px" viewBox="0 0 20 24" fill="#ED1A3B" xmlns="http://www.w3.org/2000/svg">
                                <path
                                  className="s_fill"
                                  fill="#ED1A3B"
                                  fillRule="evenodd"
                                  d="M0 4.391C0 1.938 2.007 0 4.429 0H15.57C17.993 0 20 1.938 20 4.391v7.073c0 .51-.407.923-.91.923a.916.916 0 0 1-.908-.923V4.39c0-1.381-1.141-2.545-2.611-2.545H4.429c-1.47 0-2.61 1.164-2.61 2.545v17.634l2.229-1.395a1.657 1.657 0 0 1 1.821.045l.007.004 2.275 1.63c.41.293.508.869.219 1.285a.9.9 0 0 1-1.267.223l-2.184-1.564-2.398 1.501C1.458 24.408 0 23.681 0 22.342V4.392Z"
                                  clipRule="evenodd"
                                />
                                <path
                                  className="s_fill"
                                  fill="#ED1A3B"
                                  d="M7.07 7.224c-.128 0-.232-.095-.303-.204a.568.568 0 0 0-.34-.246.849.849 0 0 0-.242-.032.809.809 0 0 0-.489.147.916.916 0 0 0-.306.423c-.07.184-.104.407-.104.667 0 .263.033.488.1.676.067.187.166.33.298.43.132.099.297.149.493.149.173 0 .316-.027.43-.082a.565.565 0 0 0 .322-.382c.027-.104.116-.189.22-.177h-.528a.431.431 0 0 1-.428-.434c0-.24.192-.435.428-.435h.973c.251 0 .455.207.455.462v.161c0 .41-.081.76-.243 1.051-.161.29-.383.512-.667.667-.282.154-.605.23-.97.23-.408 0-.765-.092-1.073-.278a1.9 1.9 0 0 1-.722-.794c-.172-.344-.257-.753-.257-1.227 0-.371.052-.7.157-.987.106-.286.253-.528.441-.726.188-.199.406-.349.652-.45.247-.102.511-.153.793-.153.248 0 .479.038.691.114.214.075.403.181.566.32a1.634 1.634 0 0 1 .46.619c.106.25-.11.491-.379.491H7.07ZM11.215 7.145c-.214 0-.373-.198-.534-.342-.09-.082-.226-.123-.41-.123a.768.768 0 0 0-.288.046.348.348 0 0 0-.164.121.313.313 0 0 0-.055.175.306.306 0 0 0 .026.147.347.347 0 0 0 .103.117.78.78 0 0 0 .177.092c.073.028.159.053.258.074l.343.08c.232.052.43.122.595.208.165.086.3.188.405.305a1.1 1.1 0 0 1 .23.39c.051.145.077.303.078.474-.001.295-.07.545-.206.75-.136.205-.331.36-.585.467-.252.107-.555.16-.91.16-.363 0-.68-.057-.951-.173a1.348 1.348 0 0 1-.63-.533 1.451 1.451 0 0 1-.18-.465c-.052-.25.16-.46.412-.46h.264c.2 0 .348.173.454.346a.545.545 0 0 0 .242.213c.104.048.23.072.374.072a.837.837 0 0 0 .304-.048.411.411 0 0 0 .186-.134.33.33 0 0 0 .065-.195.289.289 0 0 0-.063-.18.49.49 0 0 0-.196-.14 1.983 1.983 0 0 0-.37-.119l-.417-.096c-.37-.087-.663-.23-.877-.432-.212-.204-.318-.48-.316-.832a1.3 1.3 0 0 1 .212-.748c.145-.215.344-.382.599-.502.256-.12.55-.18.88-.18.339 0 .63.06.878.182a1.34 1.34 0 0 1 .71.826c.073.245-.14.457-.393.457h-.25ZM12.752 6.724a.458.458 0 0 1-.455-.461v-.06c0-.255.204-.462.455-.462h2.728c.251 0 .455.207.455.462v.06a.458.458 0 0 1-.455.461h-.35a.458.458 0 0 0-.454.462v2.586a.458.458 0 0 1-.455.462h-.21a.458.458 0 0 1-.455-.462V7.186a.458.458 0 0 0-.455-.462h-.35Z"
                                />
                              </svg>
                            </div>
                            <div className="s_flex-1">
                              <h6>GST Reconciliation</h6>
                              <p>Map multiple GST data, automate reconciliations, and identify errors.</p>
                            </div>
                          </a>
                        </div>
                        <div className="s_col-4">
                          <a className="s_flex" href="#oneplatform" onClick={() => setActiveMenu(null)}>
                            <div className="s_flex s_align-center s_content-center s_header-dropdown-bigicon">
                              <svg width="36px" height="36px" viewBox="0 0 24 22" fill="#ED1A3B" xmlns="http://www.w3.org/2000/svg">
                                <path
                                  className="s_fill"
                                  fill="#ED1A3B"
                                  fillRule="evenodd"
                                  d="M4.615 5.5a.92.92 0 0 1 .923-.917h8.308c.51 0 .923.41.923.917a.92.92 0 0 1-.923.916H5.538a.92.92 0 0 1-.923-.916ZM4.615 10.083a.92.92 0 0 1 .923-.917h6c.51 0 .923.41.923.917a.92.92 0 0 1-.922.917h-6a.92.92 0 0 1-.924-.917Z"
                                  clipRule="evenodd"
                                />
                                <path
                                  className="s_fill"
                                  fill="#ED1A3B"
                                  fillRule="evenodd"
                                  d="M3.385 1.833c-.855 0-1.539.683-1.539 1.513v12.15c0 .83.684 1.513 1.539 1.513h2.769c1.02 0 1.846.82 1.846 1.833v1.08l3.513-2.168a.927.927 0 0 1 1.271.295.913.913 0 0 1-.297 1.263l-3.981 2.456c-1.017.627-2.352-.088-2.352-1.294v-1.632h-2.77C1.522 18.842 0 17.35 0 15.496V3.346C0 1.493 1.52 0 3.385 0h17.23C22.48 0 24 1.493 24 3.346v4.86a.92.92 0 0 1-.923.917.92.92 0 0 1-.923-.917v-4.86c0-.83-.684-1.513-1.539-1.513H3.385Z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                            <div className="s_flex-1">
                              <h6>
                                Vyapar TaxOne Chat(PMS) <i>Coming Soon</i>
                              </h6>
                              <p>Automate reminders, organise documents and track every conversation.</p>
                            </div>
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>

                {/* Pricing Link */}
                <li>
                  <a href="#pricing" onClick={() => onOpenTrial()}>
                    Pricing
                  </a>
                </li>

                {/* Company Dropdown */}
                <li
                  className={activeMenu === 'company' ? 's_active' : ''}
                  onMouseEnter={() => setActiveMenu('company')}
                  onMouseLeave={() => setActiveMenu(null)}
                >
                  <span
                    className="s_flex s_align-center s_cp"
                    onClick={() => setActiveMenu(activeMenu === 'company' ? null : 'company')}
                  >
                    Company{' '}
                    <svg
                      width="14px"
                      height="7px"
                      viewBox="0 0 15 8"
                      fill="#383E4E"
                      xmlns="http://www.w3.org/2000/svg"
                      className="s_menu-icon"
                    >
                      <path
                        fill="#383E4E"
                        className="s_fill"
                        d="M7.504 8a2.272 2.272 0 0 1-1.608-.666L.463 1.9a.629.629 0 0 1 0-.884.629.629 0 0 1 .883 0l5.433 5.434c.4.4 1.05.4 1.45 0l5.434-5.434a.629.629 0 0 1 .883 0 .629.629 0 0 1 0 .884L9.113 7.334A2.272 2.272 0 0 1 7.504 8Z"
                      />
                    </svg>
                  </span>
                  <div className="s_header-dropdown">
                    <div className="s_container">
                      <div className="s_row s_align-center">
                        <div className="s_col-12">
                          <h4>Company</h4>
                        </div>
                        <div className="s_col-4">
                          <a className="s_flex" href="#about" onClick={() => setActiveMenu(null)}>
                            <div className="s_flex s_align-center s_content-center s_header-dropdown-bigicon">
                              <svg width="36px" height="36px" viewBox="0 0 22 24" fill="#ED1A3B" xmlns="http://www.w3.org/2000/svg">
                                <path
                                  className="s_fill"
                                  fill="#ED1A3B"
                                  d="M17 0H7a5 5 0 0 0-4.576 3H1a1 1 0 0 0 0 2h1v2H1a1 1 0 0 0 0 2h1v2H1a1 1 0 0 0 0 2h1v2H1a1 1 0 0 0 0 2h1v2H1a1 1 0 0 0 0 2h1.424A5 5 0 0 0 7 24h10a5.006 5.006 0 0 0 5-5V5a5.006 5.006 0 0 0-5-5Zm3 19a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V5a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v14Zm-8-7a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm5 6a1 1 0 0 1-2 0 3 3 0 0 0-6 0 1 1 0 1 1-2 0c.211-6.608 9.791-6.606 10 0Z"
                                />
                              </svg>
                            </div>
                            <div className="s_flex-1">
                              <h6>About Us</h6>
                              <p>Want to know the Spirit of Vyapar TaxOne? Tap here</p>
                            </div>
                          </a>
                        </div>
                        <div className="s_col-4">
                          <a className="s_flex" href="#career" onClick={() => setActiveMenu(null)}>
                            <div className="s_flex s_align-center s_content-center s_header-dropdown-bigicon">
                              <svg width="36px" height="36px" viewBox="0 0 24 24" fill="#ED1A3B" xmlns="http://www.w3.org/2000/svg">
                                <path
                                  className="s_fill"
                                  fill="#ED1A3B"
                                  d="M22.445 2.067 19.858.515A3.606 3.606 0 0 0 18.001 0C17.449 0 17 .448 17 1v10a1 1 0 0 0 2 0V6l3.444-2.066a1.088 1.088 0 0 0 .001-1.867ZM8.5 5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"
                                />
                                <path
                                  className="s_fill"
                                  fill="#ED1A3B"
                                  d="M21 14h-3c-1.654 0-3 1.346-3 3v1.171A2.98 2.98 0 0 0 14 18h-3v-2.277c0-.865-.552-1.627-1.373-1.899l-1.331-.44L9.724 8h1.222c.543 0 1.077-.148 1.543-.428l2.026-1.215a1 1 0 1 0-1.029-1.715l-2.025 1.215a1.007 1.007 0 0 1-.515.143H6.309c-1.17 0-2.198.831-2.432 1.926l-.897 3.348a2.5 2.5 0 0 0 .988 2.662L3.28 16H1a1 1 0 0 0 0 2h2.279c.862 0 1.625-.549 1.897-1.367l.652-1.957 3.171 1.047v3.058c-.609.549-1 1.337-1 2.22v1H1a1 1 0 0 0 0 2h8a1 1 0 0 0 1-1v-2c0-.551.449-1 1-1h3c.552 0 1 .449 1 1v2a1 1 0 1 0 2 0v-6c0-.551.448-1 1-1h3c.552 0 1 .449 1 1v6a1 1 0 1 0 2 0v-6c0-1.654-1.346-3-3-3V14ZM4.913 11.784l.907-3.389A.503.503 0 0 1 6.309 8h1.346l-1.262 4.756-1.15-.38a.5.5 0 0 1-.33-.592Z"
                                />
                              </svg>
                            </div>
                            <div className="s_flex-1">
                              <h6>Career</h6>
                              <p>Join us in making a significant impact on the lives of Tax Professionals!</p>
                            </div>
                          </a>
                        </div>
                        <div className="s_col-4">
                          <a className="s_flex" href="#contact" onClick={() => setActiveMenu(null)}>
                            <div className="s_flex s_align-center s_content-center s_header-dropdown-bigicon">
                              <svg width="36px" height="36px" viewBox="0 0 24 24" fill="#ED1A3B" xmlns="http://www.w3.org/2000/svg">
                                <path
                                  className="s_fill"
                                  fill="#ED1A3B"
                                  d="M13 1a1 1 0 0 1 1-1 10.01 10.01 0 0 1 10 10 1 1 0 0 1-2 0 8.009 8.009 0 0 0-8-8 1 1 0 0 1-1-1Zm1 5a4 4 0 0 1 4 4 1 1 0 1 0 2 0 6.006 6.006 0 0 0-6-6 1 1 0 1 0 0 2Zm9.093 10.739a3.1 3.1 0 0 1 0 4.378l-.91 1.049c-8.19 7.841-28.12-12.084-20.4-20.3l1.15-1a3.081 3.081 0 0 1 4.327.04c.031.031 1.884 2.438 1.884 2.438a3.1 3.1 0 0 1-.007 4.282L7.979 9.082a12.78 12.78 0 0 0 6.931 6.945l1.465-1.165a3.1 3.1 0 0 1 4.281-.006s2.406 1.852 2.437 1.883Zm-1.376 1.454s-2.393-1.841-2.424-1.872a1.1 1.1 0 0 0-1.549 0c-.027.028-2.044 1.635-2.044 1.635a1 1 0 0 1-.979.152A15.009 15.009 0 0 1 5.9 9.3a1 1 0 0 1 .145-1s1.607-2.018 1.634-2.044a1.1 1.1 0 0 0 0-1.549c-.031-.03-1.872-2.425-1.872-2.425a1.1 1.1 0 0 0-1.51.039l-1.15 1C-2.495 10.105 14.776 26.418 20.721 20.8l.911-1.05a1.12 1.12 0 0 0 .085-1.557Z"
                                />
                              </svg>
                            </div>
                            <div className="s_flex-1">
                              <h6>Contact Us</h6>
                              <p>Got questions? Reach out to us!</p>
                            </div>
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>

                {/* Resources Dropdown */}
                <li
                  className={activeMenu === 'resources' ? 's_active' : ''}
                  onMouseEnter={() => setActiveMenu('resources')}
                  onMouseLeave={() => setActiveMenu(null)}
                >
                  <span
                    className="s_flex s_align-center s_cp"
                    onClick={() => setActiveMenu(activeMenu === 'resources' ? null : 'resources')}
                  >
                    Resources{' '}
                    <svg
                      width="14px"
                      height="7px"
                      viewBox="0 0 15 8"
                      fill="#383E4E"
                      xmlns="http://www.w3.org/2000/svg"
                      className="s_menu-icon"
                    >
                      <path
                        fill="#383E4E"
                        className="s_fill"
                        d="M7.504 8a2.272 2.272 0 0 1-1.608-.666L.463 1.9a.629.629 0 0 1 0-.884.629.629 0 0 1 .883 0l5.433 5.434c.4.4 1.05.4 1.45 0l5.434-5.434a.629.629 0 0 1 .883 0 .629.629 0 0 1 0 .884L9.113 7.334A2.272 2.272 0 0 1 7.504 8Z"
                      />
                    </svg>
                  </span>
                  <div className="s_header-dropdown">
                    <div className="s_container">
                      <div className="s_row s_content-between">
                        <div className="s_col-12">
                          <h4>Resources</h4>
                        </div>
                        <div className="s_col-8">
                          <div className="s_row">
                            <div className="s_col-6">
                              <a className="s_flex" href="#blog" onClick={() => setActiveMenu(null)}>
                                <div className="s_flex s_align-center s_content-center s_header-dropdown-bigicon">
                                  <svg width="36px" height="36px" viewBox="0 0 24 20" fill="#ED1A3B" xmlns="http://www.w3.org/2000/svg">
                                    <path
                                      className="s_fill"
                                      fill="#ED1A3B"
                                      d="M19 0H5C2.24 0 0 2.24 0 5v10c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5V5c0-2.76-2.24-5-5-5ZM5 2h14c1.65 0 3 1.35 3 3H2c0-1.65 1.35-3 3-3Zm14 16H5c-1.65 0-3-1.35-3-3V7h20v8c0 1.65-1.35 3-3 3Zm-9-8c0 .55-.45 1-1 1H8v4c0 .55-.45 1-1 1s-1-.45-1-1v-4H5c-.55 0-1-.45-1-1s.45-1 1-1h4c.55 0 1 .45 1 1Zm10 0c0 .55-.45 1-1 1h-6c-.55 0-1-.45-1-1s.45-1 1-1h6c.55 0 1 .45 1 1Zm0 4c0 .55-.45 1-1 1h-6c-.55 0-1-.45-1-1s.45-1 1-1h6c.55 0 1 .45 1 1Z"
                                    />
                                  </svg>
                                </div>
                                <div className="s_flex-1">
                                  <h6>Blog</h6>
                                  <p>Level up your financial knowledge with our informative blogs.</p>
                                </div>
                              </a>
                            </div>
                            <div className="s_col-6">
                              <a className="s_flex" href="#calculator" onClick={() => setActiveMenu(null)}>
                                <div className="s_flex s_align-center s_content-center s_header-dropdown-bigicon">
                                  <svg width="36px" height="36px" viewBox="0 0 22 24" fill="#ED1A3B" xmlns="http://www.w3.org/2000/svg">
                                    <path
                                      className="s_fill"
                                      fill="#ED1A3B"
                                      d="M17 24H5a5.006 5.006 0 0 1-5-5V5a5.006 5.006 0 0 1 5-5h12a5.006 5.006 0 0 1 5 5v14a5.006 5.006 0 0 1-5 5ZM5 2a3 3 0 0 0-3 3v14a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3V5a3 3 0 0 0-3-3H5Zm10 8H7a3 3 0 1 1 0-6h8a3 3 0 0 1 0 6ZM7 6a1 1 0 0 0 0 2h8a1 1 0 1 0 0-2H7Zm-2 7a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm4 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm4 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm-8 4a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm4 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm8-4a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm1 5a1 1 0 0 0-1-1h-4a1 1 0 0 0 0 2h4a1 1 0 0 0 1-1Z"
                                    />
                                  </svg>
                                </div>
                                <div className="s_flex-1">
                                  <h6>Calculator</h6>
                                  <p>Make smarter financial decisions with our easy-to-use calculators.</p>
                                </div>
                              </a>
                            </div>
                            <div className="s_col-6">
                              <a className="s_flex" href="#webinars" onClick={() => setActiveMenu(null)}>
                                <div className="s_flex s_align-center s_content-center s_header-dropdown-bigicon">
                                  <svg width="36px" height="36px" viewBox="0 0 24 24" fill="#ED1A3B" xmlns="http://www.w3.org/2000/svg">
                                    <path
                                      className="s_fill"
                                      fill="#ED1A3B"
                                      d="M16.5 7.223V4.778a.776.776 0 0 1 1.153-.679l2.201 1.223a.776.776 0 0 1 0 1.357l-2.201 1.223a.776.776 0 0 1-1.153-.679ZM12 6c0-3.309 2.691-6 6-6s6 2.691 6 6-2.691 6-6 6-6-2.691-6-6Zm2 0c0 2.206 1.794 4 4 4s4-1.794 4-4-1.794-4-4-4-4 1.794-4 4Zm-3.5 2.5a2.5 2.5 0 1 0-5 0 2.5 2.5 0 0 0 5 0ZM23 12a1 1 0 0 0-1 1v2c0 1.654-1.346 3-3 3H5c-1.654 0-3-1.346-3-3V7c0-1.654 1.346-3 3-3h5a1 1 0 1 0 0-2H5C2.243 2 0 4.243 0 7v8c0 2.757 2.243 5 5 5h6v2H7a1 1 0 1 0 0 2h10a1 1 0 1 0 0-2h-4v-2h6c2.757 0 5-2.243 5-5v-2a1 1 0 0 0-1-1ZM8 12c-1.761 0-3.343 1.064-3.937 2.649a1 1 0 0 0 1.873.701c.303-.808 1.132-1.351 2.063-1.351.931 0 1.761.543 2.063 1.351a1.001 1.001 0 0 0 1.873-.701C11.341 13.064 9.759 12 7.998 12H8Z"
                                    />
                                  </svg>
                                </div>
                                <div className="s_flex-1">
                                  <h6>Webinars</h6>
                                  <p>Unlock expert accounting & auditing strategies with our webinars.</p>
                                </div>
                              </a>
                            </div>
                            <div className="s_col-6">
                              <a className="s_flex" href="#help" onClick={() => setActiveMenu(null)}>
                                <div className="s_flex s_align-center s_content-center s_header-dropdown-bigicon">
                                  <svg width="36px" height="36px" viewBox="0 0 24 24" fill="#ED1A3B" xmlns="http://www.w3.org/2000/svg">
                                    <path
                                      className="s_fill"
                                      fill="#ED1A3B"
                                      d="M12 0a12 12 0 1 0 12 12A12.013 12.013 0 0 0 12 0Zm0 22a10 10 0 1 1 10-10 10.011 10.011 0 0 1-10 10Z"
                                    />
                                    <path
                                      className="s_fill"
                                      fill="#ED1A3B"
                                      d="M12.717 5.063A4 4 0 0 0 8 9a1 1 0 0 0 2 0 2 2 0 0 1 3.414-1.414c.285.285.48.647.557 1.042a2 2 0 0 1-1 2.125A3.955 3.955 0 0 0 11 14.257V15a1 1 0 0 0 2 0v-.743a1.982 1.982 0 0 1 .93-1.752 4 4 0 0 0-1.213-7.442ZM13 18a1 1 0 1 0-2 0 1 1 0 0 0 2 0Z"
                                    />
                                  </svg>
                                </div>
                                <div className="s_flex-1">
                                  <h6>Help Center</h6>
                                  <p>Explore How-To&apos;s and Learn Best Practices from our Knowledge Base.</p>
                                </div>
                              </a>
                            </div>
                          </div>
                        </div>
                        <div className="s_col-3">
                          <div className="s_row">
                            <div className="s_col-12">
                              <div className="s_header-dropdown-blog">
                                <h5>Latest Blog</h5>
                                <div className="s_header-dropdown-blog-img">
                                  <img
                                    src="https://strapi.taxone.vyapar.com/uploads/PTEC_vs_PTRC_57f9f4524a.webp"
                                    alt="Latest Blog"
                                    className="rounded-lg w-full h-auto"
                                    loading="lazy"
                                  />
                                </div>
                                <div className="s_header-dropdown-blog-content">
                                  <a href="#blog">PTEC vs PTRC in Maharashtra: Difference & Guide</a>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              </ul>
            </div>

            <div className="s_flex s_align-center">
              <button
                className="s_button s_signup-header-button"
                type="button"
                onClick={onOpenTrial}
              >
                Sign up now
              </button>

              <Link className="s_button s_button-trans s_button-header" href="/login">
                Sign In
              </Link>

              {/* Mobile Hamburger Menu Toggle */}
              <div
                className="s_header-bar cursor-pointer"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Toggle Navigation"
              >
                <svg width="28" height="28" viewBox="0 0 100 100" fill="currentColor">
                  <path
                    className="s_header-bar-line s_line-1"
                    d={mobileOpen ? 'M 20,20 L 80,80' : 'M 20,29 H 80'}
                    stroke="#1c1f27"
                    strokeWidth="8"
                    strokeLinecap="round"
                  />
                  {!mobileOpen && (
                    <path
                      className="s_header-bar-line s_line-2"
                      d="M 20,50 H 80"
                      stroke="#1c1f27"
                      strokeWidth="8"
                      strokeLinecap="round"
                    />
                  )}
                  <path
                    className="s_header-bar-line s_line-3"
                    d={mobileOpen ? 'M 20,80 L 80,20' : 'M 20,71 H 80'}
                    stroke="#1c1f27"
                    strokeWidth="8"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </header>
      {mobileOpen && (
        <div
          className="s_overlay block fixed inset-0 bg-black/50 z-[90]"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </>
  );
}

