import { memo } from 'react';

const SettingsIcon = () => (
    <svg width="48px" height="48px" viewBox="0 0 48 48">
        <g fill="#3bb34a">
            <g>
                <rect transform="rotate(-45)" x="-24" y="29" width="48" height="10" />
                <rect x="19" width="10" height="48" />
                <rect y="19" width="48" height="10" />
                <rect transform="rotate(45)" x="10" y="-5" width="48" height="10" />
            </g>
            <circle cx="24" cy="24" r="18" />
        </g>
        <circle cx="24" cy="24" r="9" fill="#fff" />
    </svg>
);

export default memo(SettingsIcon);