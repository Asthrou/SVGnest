import { memo } from 'react';

const FAQIcon = () => (
    <svg width="48px" height="48px" viewBox="0 0 48 48">
        <g fill="#3cb34b">
            <circle cx="25" cy="17" r="15" />
            <rect x="19" y="26" width="10" height="8" />
            <circle cx="24" cy="41" r="5" stroke-width="2" />
        </g>
        <g transform="translate(2,-1)" fill="#fff">
            <circle cx="23" cy="18" r="9" />
            <rect x="7" y="16" width="10" height="23" />
            <rect x="8" y="16" width="15" height="11" />
        </g>
    </svg>
);

export default memo(FAQIcon);