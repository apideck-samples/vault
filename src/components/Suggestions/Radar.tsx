import { IConnection } from 'types/Connection'

const Radar = ({ connections }: { connections: IConnection[] }) => (
  <div className="absolute top-0 w-full -z-10 opacity-90">
    <RadarSvg connections={connections} />
  </div>
)

const RadarSvg = ({ connections }: { connections: IConnection[] }) => {
  const uniqueConnections: IConnection[] = []

  connections.map((connection) => {
    const isPresent = uniqueConnections.find((con) => con.service_id === connection.service_id)
    if (!isPresent) uniqueConnections.push(connection)
  })

  return (
    <svg
      width="100%"
      viewBox="0 0 1002 500"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
    >
      <defs>
        <rect id="path-1" x={0} y={0} width={1042} height={500} />
        <filter
          x="-30.0%"
          y="-30.0%"
          width="160.0%"
          height="158.6%"
          filterUnits="objectBoundingBox"
          id="filter-3"
        >
          <feOffset dx={0} dy={4} in="SourceAlpha" result="shadowOffsetOuter1" />
          <feGaussianBlur stdDeviation={3} in="shadowOffsetOuter1" result="shadowBlurOuter1" />
          <feColorMatrix
            values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.15 0"
            type="matrix"
            in="shadowBlurOuter1"
            result="shadowMatrixOuter1"
          />
          <feMerge>
            <feMergeNode in="shadowMatrixOuter1" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <circle id="path-4" cx="32.5153606" cy="32.3986199" r="32.0422535" />
        <filter
          x="-17.9%"
          y="-11.7%"
          width="135.9%"
          height="135.9%"
          filterUnits="objectBoundingBox"
          id="filter-5"
        >
          <feMorphology
            radius="0.501680672"
            operator="dilate"
            in="SourceAlpha"
            result="shadowSpreadOuter1"
          />
          <feOffset dx={0} dy={4} in="shadowSpreadOuter1" result="shadowOffsetOuter1" />
          <feGaussianBlur stdDeviation={3} in="shadowOffsetOuter1" result="shadowBlurOuter1" />
          <feComposite
            in="shadowBlurOuter1"
            in2="SourceAlpha"
            operator="out"
            result="shadowBlurOuter1"
          />
          <feColorMatrix
            values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.15 0"
            type="matrix"
            in="shadowBlurOuter1"
          />
        </filter>
        <filter
          x="-26.7%"
          y="-28.0%"
          width="154.7%"
          height="156.0%"
          filterUnits="objectBoundingBox"
          id="filter-6"
        >
          <feOffset dx={0} dy={4} in="SourceAlpha" result="shadowOffsetOuter1" />
          <feGaussianBlur stdDeviation={3} in="shadowOffsetOuter1" result="shadowBlurOuter1" />
          <feColorMatrix
            values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.15 0"
            type="matrix"
            in="shadowBlurOuter1"
            result="shadowMatrixOuter1"
          />
          <feMerge>
            <feMergeNode in="shadowMatrixOuter1" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <circle id="path-7" cx="30.2672992" cy="29.9201574" r="29.4827586" />
        <filter
          x="-16.1%"
          y="-11.0%"
          width="132.2%"
          height="132.2%"
          filterUnits="objectBoundingBox"
          id="filter-8"
        >
          <feMorphology
            radius="0.501680672"
            operator="dilate"
            in="SourceAlpha"
            result="shadowSpreadOuter1"
          />
          <feOffset dx={0} dy={3} in="shadowSpreadOuter1" result="shadowOffsetOuter1" />
          <feGaussianBlur stdDeviation="2.5" in="shadowOffsetOuter1" result="shadowBlurOuter1" />
          <feComposite
            in="shadowBlurOuter1"
            in2="SourceAlpha"
            operator="out"
            result="shadowBlurOuter1"
          />
          <feColorMatrix
            values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.15 0"
            type="matrix"
            in="shadowBlurOuter1"
          />
        </filter>
        <circle id="path-9" cx="31.9427926" cy="31.334491" r={31} />
        <filter
          x="-18.6%"
          y="-12.1%"
          width="137.1%"
          height="137.1%"
          filterUnits="objectBoundingBox"
          id="filter-10"
        >
          <feMorphology
            radius="0.501680672"
            operator="dilate"
            in="SourceAlpha"
            result="shadowSpreadOuter1"
          />
          <feOffset dx={0} dy={4} in="shadowSpreadOuter1" result="shadowOffsetOuter1" />
          <feGaussianBlur stdDeviation={3} in="shadowOffsetOuter1" result="shadowBlurOuter1" />
          <feComposite
            in="shadowBlurOuter1"
            in2="SourceAlpha"
            operator="out"
            result="shadowBlurOuter1"
          />
          <feColorMatrix
            values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.15 0"
            type="matrix"
            in="shadowBlurOuter1"
          />
        </filter>
        <circle id="path-11" cx="31.2850671" cy="30.9923464" r="30.975" />
        <filter
          x="-15.3%"
          y="-10.5%"
          width="130.7%"
          height="130.7%"
          filterUnits="objectBoundingBox"
          id="filter-12"
        >
          <feMorphology
            radius="0.501680672"
            operator="dilate"
            in="SourceAlpha"
            result="shadowSpreadOuter1"
          />
          <feOffset dx={0} dy={3} in="shadowSpreadOuter1" result="shadowOffsetOuter1" />
          <feGaussianBlur stdDeviation="2.5" in="shadowOffsetOuter1" result="shadowBlurOuter1" />
          <feComposite
            in="shadowBlurOuter1"
            in2="SourceAlpha"
            operator="out"
            result="shadowBlurOuter1"
          />
          <feColorMatrix
            values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.15 0"
            type="matrix"
            in="shadowBlurOuter1"
          />
        </filter>
      </defs>
      <g id="Page-1" stroke="none" strokeWidth={1} fill="none" fillRule="evenodd">
        <g id="radar" transform="translate(-491.000000, -565.000000)">
          <g id="Group" transform="translate(458.000000, 565.000000)">
            <mask id="mask-2" fill="white">
              <use xlinkHref="#path-1" />
            </mask>
            <g id="Rectangle" />
            <g id="circles-and-dots" mask="url(#mask-2)">
              <g transform="translate(34.000000, -500.000000)">
                <g id="Group" stroke="none" strokeWidth={1} fillRule="evenodd">
                  <circle
                    id="Oval"
                    stroke="#E2E8F0"
                    strokeWidth="2.00672269"
                    opacity="0.501861213"
                    cx="499.99718"
                    cy="499.99718"
                    r="499.99718"
                  />
                </g>
                <g
                  id="Group"
                  stroke="none"
                  strokeWidth={1}
                  fillRule="evenodd"
                  transform="translate(127.103660, 127.103660)"
                  opacity="0.499471507"
                >
                  <circle
                    id="Oval"
                    stroke="#E2E8F0"
                    strokeWidth="2.00672269"
                    cx="372.89352"
                    cy="372.89352"
                    r="372.89352"
                  />
                </g>
                <g
                  id="Group"
                  stroke="none"
                  strokeWidth={1}
                  fillRule="evenodd"
                  transform="translate(209.594778, 209.594778)"
                  opacity="0.500298713"
                >
                  <circle
                    id="Oval"
                    stroke="#E2E8F0"
                    strokeWidth="2.00672269"
                    cx="290.402403"
                    cy="290.402403"
                    r="290.402403"
                  />
                </g>
                <circle
                  id="Oval"
                  stroke="#E2E8F0"
                  strokeWidth="1.00336134"
                  opacity="0.496001838"
                  cx="499.99718"
                  cy="499.99718"
                  r="216.328746"
                />
                <g
                  id="Group"
                  stroke="none"
                  strokeWidth={1}
                  fillRule="evenodd"
                  transform="translate(334.173199, 334.173199)"
                  opacity="0.2"
                >
                  <circle
                    id="Oval"
                    stroke="#A2B0D0"
                    strokeWidth="1.00336134"
                    cx="165.823981"
                    cy="165.823981"
                    r="165.823981"
                  />
                </g>
                <g
                  id="Group"
                  stroke="none"
                  strokeWidth={1}
                  fillRule="evenodd"
                  transform="translate(387.000000, 388.000000)"
                  opacity="0.504779412"
                >
                  <circle
                    id="Oval"
                    stroke="#E2E8F0"
                    strokeWidth="1.00336134"
                    cx="112.815098"
                    cy="112.5"
                    r="112.5"
                  />
                </g>
              </g>
            </g>
            <g id="integrations" mask="url(#mask-2)">
              <g transform="translate(174.397947, 43.334499)" id="Group">
                <g filter="url(#filter-3)" transform="translate(543.602053, 227.665501)">
                  <circle
                    id="Oval"
                    strokeOpacity="0.3"
                    stroke="#A2B0D0"
                    strokeWidth="1.00336134"
                    fill="#FFFFFF"
                    fillRule="nonzero"
                    cx="35.0311312"
                    cy="34.9009461"
                    r="34.5783133"
                  />
                  <image
                    id="Bitmap"
                    opacity="0.847817"
                    x="16.4769144"
                    y="17.1901027"
                    width="37.1084337"
                    height="37.1084337"
                    xlinkHref={
                      (uniqueConnections?.length && uniqueConnections[0].icon) ||
                      '/img/integrations/drive.png'
                    }
                  />
                </g>
                <g transform="translate(200.602053, 180.665501)">
                  <g id="Oval" fillRule="nonzero">
                    <use fill="black" fillOpacity={1} filter="url(#filter-5)" xlinkHref="#path-4" />
                    <use
                      strokeOpacity="0.3"
                      stroke="#A2B0D0"
                      strokeWidth="1.00336134"
                      fill="#FFFFFF"
                      xlinkHref="#path-4"
                    />
                  </g>
                  <image
                    id="icon128x128"
                    opacity="0.853814"
                    x="16.0364874"
                    y="15.0042537"
                    width="34.7887324"
                    height="34.7887324"
                    xlinkHref={
                      (uniqueConnections?.length >= 3 && uniqueConnections[2].icon) ||
                      '/img/integrations/hubspot.png'
                    }
                  />
                </g>
                <g filter="url(#filter-6)" transform="translate(0.602053, 302.665501)">
                  <circle
                    id="Oval"
                    strokeOpacity="0.3"
                    stroke="#A2B0D0"
                    strokeWidth="1.00336134"
                    fill="#FFFFFF"
                    fillRule="nonzero"
                    cx="37.765065"
                    cy="37.518742"
                    r="37.1010638"
                  />
                  <image
                    id="Bitmap"
                    opacity="0.852895"
                    x="16.621448"
                    y="16.3751249"
                    width="41.4893617"
                    height="42.287234"
                    xlinkHref={
                      (uniqueConnections?.length >= 2 && uniqueConnections[1].icon) ||
                      '/img/integrations/intercom.png'
                    }
                  />
                </g>
                <g transform="translate(426.602053, 56.665501)">
                  <g id="Oval" fillRule="nonzero">
                    <use fill="black" fillOpacity={1} filter="url(#filter-8)" xlinkHref="#path-7" />
                    <use
                      strokeOpacity="0.3"
                      stroke="#A2B0D0"
                      strokeWidth="1.00336134"
                      fill="#FFFFFF"
                      xlinkHref="#path-7"
                    />
                  </g>
                  <image
                    id="icon128x128"
                    opacity="0.85"
                    x="15.2672992"
                    y="15.9546401"
                    width={30}
                    height={30}
                    xlinkHref={
                      (uniqueConnections?.length >= 5 && uniqueConnections[4].icon) ||
                      '/img/integrations/mailchimp.png'
                    }
                  />
                </g>
                <g transform="translate(126.602053, 5.665501)">
                  <g id="Oval" fillRule="nonzero">
                    <use
                      fill="black"
                      fillOpacity={1}
                      filter="url(#filter-10)"
                      xlinkHref="#path-9"
                    />
                    <use
                      strokeOpacity="0.3"
                      stroke="#A2B0D0"
                      strokeWidth="1.00336134"
                      fill="#FFFFFF"
                      xlinkHref="#path-9"
                    />
                  </g>
                  <image
                    id="Bitmap"
                    opacity="0.85"
                    x="15.7084176"
                    y="15.100116"
                    width={33}
                    height={33}
                    xlinkHref={
                      (uniqueConnections?.length >= 6 && uniqueConnections[5].icon) ||
                      '/img/integrations/drive.png'
                    }
                  />
                </g>
                <g transform="translate(604.602053, 0.665501)">
                  <g id="Oval" fillRule="nonzero">
                    <use
                      fill="black"
                      fillOpacity={1}
                      filter="url(#filter-12)"
                      xlinkHref="#path-11"
                    />
                    <use
                      strokeOpacity="0.3"
                      stroke="#A2B0D0"
                      strokeWidth="1.00336134"
                      fill="#FFFFFF"
                      xlinkHref="#path-11"
                    />
                  </g>
                  <image
                    id="icon128x128"
                    opacity="0.85"
                    x="13.9600671"
                    y="14.7173464"
                    width="33.6"
                    height="33.6"
                    xlinkHref={
                      (uniqueConnections?.length >= 4 && uniqueConnections[3].icon) ||
                      '/img/integrations/dropbox.png'
                    }
                  />
                </g>
              </g>
            </g>
          </g>
        </g>
      </g>
    </svg>
  )
}

export default Radar
