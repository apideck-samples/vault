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
      height="auto"
      viewBox="0 0 1002 500"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
    >
      <defs>
        <rect id="path-1" x={0} y={0} width={1042} height={500} />
        <filter
          x="-24.1%"
          y="-25.3%"
          width="149.4%"
          height="149.4%"
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
        <circle id="path-4" cx="35.5167785" cy="35.3892617" r={35} />
        <filter
          x="-16.4%"
          y="-10.7%"
          width="132.9%"
          height="132.9%"
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
          x="-21.3%"
          y="-21.3%"
          width="143.6%"
          height="143.6%"
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
        <circle id="path-7" cx="29.2583893" cy="28.9228188" r="28.5" />
        <filter
          x="-16.7%"
          y="-11.4%"
          width="133.3%"
          height="133.3%"
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
        <circle id="path-9" cx="31.9577576" cy="31.3398003" r={31} />
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
        <circle id="path-11" cx="29.795302" cy="30.4395973" r="29.5" />
        <filter
          x="-16.1%"
          y="-11.0%"
          width="132.2%"
          height="132.2%"
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
                  transform="translate(376.260504, 376.260504)"
                  opacity="0.504779412"
                >
                  <circle
                    id="Oval"
                    stroke="#E2E8F0"
                    strokeWidth="1.00336134"
                    cx="124.157549"
                    cy="124.157549"
                    r="124.157549"
                  />
                </g>
              </g>
            </g>
            <g id="integrations" mask="url(#mask-2)">
              <g transform="translate(182.397947, 45.334499)" id="Group">
                <g filter="url(#filter-3)" transform="translate(520.602053, 217.665501)">
                  <circle
                    id="Oval"
                    strokeOpacity="0.3"
                    stroke="#A2B0D0"
                    strokeWidth="1.00336134"
                    fill="#FFFFFF"
                    fillRule="nonzero"
                    cx="41.5369128"
                    cy="41.3825503"
                    r={41}
                  />
                  <image
                    id="Bitmap"
                    opacity="0.847817"
                    x="19.5369128"
                    y="20.3825503"
                    width={44}
                    height={44}
                    xlinkHref={
                      (uniqueConnections?.length >= 6 && uniqueConnections[5].icon) ||
                      '/img/integrations/intercom.png'
                    }
                  />
                </g>
                <g transform="translate(220.085274, 193.276239)">
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
                    x="17.5167785"
                    y="16.3892617"
                    width={38}
                    height={38}
                    xlinkHref={
                      (uniqueConnections?.length >= 1 && uniqueConnections[0].icon) ||
                      '/img/integrations/dropbox.png'
                    }
                  />
                </g>
                <g filter="url(#filter-6)" transform="translate(0.769838, 300.142011)">
                  <circle
                    id="Oval"
                    strokeOpacity="0.3"
                    stroke="#A2B0D0"
                    strokeWidth="1.00336134"
                    fill="#FFFFFF"
                    fillRule="nonzero"
                    cx="47.3322148"
                    cy="47.0234899"
                    r="46.5"
                  />
                  <image
                    id="Bitmap"
                    opacity="0.852895"
                    x="20.8322148"
                    y="20.5234899"
                    width={52}
                    height={53}
                    xlinkHref={
                      (uniqueConnections?.length >= 2 && uniqueConnections[1].icon) ||
                      '/img/integrations/drive.png'
                    }
                  />
                </g>
                <g transform="translate(411.843664, 62.242682)">
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
                    x="14.7583893"
                    y="15.4228188"
                    width={29}
                    height={29}
                    xlinkHref={
                      (uniqueConnections?.length >= 3 && uniqueConnections[2].icon) ||
                      '/img/integrations/hubspot.png'
                    }
                  />
                </g>
                <g transform="translate(117.644295, 0.325701)">
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
                    x="14.9577576"
                    y="14.3398003"
                    width={33}
                    height={33}
                    xlinkHref={
                      (uniqueConnections?.length >= 4 && uniqueConnections[3].icon) ||
                      '/img/integrations/drive.png'
                    }
                  />
                </g>
                <g
                  transform="translate(582.306751, 61.725904)"
                  className="rotate-reverse animation-duration--1s"
                >
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
                    x="13.295302"
                    y="14.9395973"
                    width={32}
                    height={32}
                    xlinkHref={
                      (uniqueConnections?.length >= 5 && uniqueConnections[4].icon) ||
                      '/img/integrations/mailchimp.png'
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
