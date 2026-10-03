import React from 'react';
import type { GrasshopperModuleId } from '../types/linux';

interface ModuleIconProps {
  moduleId: GrasshopperModuleId;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ModuleIcon: React.FC<ModuleIconProps> = ({
  moduleId,
  size = 'md',
  className = '',
}) => {
  const sizeClasses =
    size === 'lg'
      ? 'w-32 h-32'
      : size === 'sm'
      ? 'w-14 h-14'
      : 'w-[108px] h-[108px]';

  return (
    <div
      className={`relative rounded-full select-none flex-shrink-0 transition-transform duration-300 ${sizeClasses} ${className}`}
    >
      {moduleId === 'getting-started' && (
        <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-md">
          <defs>
            <clipPath id="clip-getting-started">
              <circle cx="60" cy="60" r="56" />
            </clipPath>
          </defs>
          <g clipPath="url(#clip-getting-started)">
            {/* Sky Background */}
            <circle cx="60" cy="60" r="56" fill="#bfe3f7" />
            {/* Diagonal Sky Sheen */}
            <polygon points="-10,55 130,5 130,35 -10,85" fill="#d4eefb" opacity="0.7" />
            {/* Soft Clouds */}
            <g fill="#ffffff" opacity="0.92">
              <circle cx="30" cy="36" r="10" />
              <circle cx="42" cy="34" r="13" />
              <circle cx="54" cy="38" r="9" />
              <circle cx="88" cy="28" r="11" />
              <circle cx="100" cy="31" r="8" />
            </g>
            {/* Distant Dark Green Hill */}
            <path
              d="M -5,84 Q 35,54 88,76 L 125,95 L -5,120 Z"
              fill="#4fa643"
            />
            {/* Foreground Bright Green Hill */}
            <path
              d="M -5,92 Q 55,62 125,70 L 125,125 L -5,125 Z"
              fill="#86c83f"
            />
            {/* Winding Path */}
            <path
              d="M 28,122 Q 46,92 68,71 L 84,73 Q 72,96 64,122 Z"
              fill="#d8eb8d"
            />
            {/* Right Hill Deeper Shade */}
            <path
              d="M 84,73 Q 105,71 125,74 L 125,125 L 64,122 Q 72,96 84,73 Z"
              fill="#72b634"
            />
          </g>
        </svg>
      )}

      {moduleId === 'command-line' && (
        <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-md">
          <defs>
            <clipPath id="clip-command-line">
              <circle cx="60" cy="60" r="56" />
            </clipPath>
          </defs>
          <g clipPath="url(#clip-command-line)">
            {/* Pink Circle Base */}
            <circle cx="60" cy="60" r="56" fill="#e64373" />
            {/* 45-degree Long Shadow */}
            <polygon
              points="34,78 86,40 135,89 85,130"
              fill="#000000"
              opacity="0.18"
            />
            {/* Terminal Window Body */}
            <rect x="34" y="40" width="52" height="38" rx="3" fill="#3b3c40" />
            {/* Terminal Top Bar */}
            <path
              d="M 34,43 Q 34,40 37,40 L 83,40 Q 86,40 86,43 L 86,47 L 34,47 Z"
              fill="#28292c"
            />
            {/* Prompt Symbol >_ */}
            <path
              d="M 40,53 L 45,56.5 L 40,60"
              fill="none"
              stroke="#d1d5db"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <line
              x1="47"
              y1="60"
              x2="53"
              y2="60"
              stroke="#d1d5db"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          </g>
        </svg>
      )}

      {moduleId === 'text-fu' && (
        <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-md">
          <defs>
            <clipPath id="clip-text-fu">
              <circle cx="60" cy="60" r="56" />
            </clipPath>
          </defs>
          <g clipPath="url(#clip-text-fu)">
            {/* Orange Circle Base */}
            <circle cx="60" cy="60" r="56" fill="#f29b13" />
            {/* 45-degree Long Shadow */}
            <polygon
              points="44,86 76,34 132,90 90,132"
              fill="#000000"
              opacity="0.18"
            />
            {/* Martial Arts Glove (Red) */}
            {/* Fingers */}
            <rect x="44" y="34" width="7.5" height="18" rx="3.75" fill="#c94642" />
            <rect x="52.5" y="32" width="7.5" height="20" rx="3.75" fill="#d9534f" />
            <rect x="61" y="33" width="7.5" height="19" rx="3.75" fill="#d9534f" />
            <rect x="69.5" y="36" width="7.5" height="17" rx="3.75" fill="#c94642" />
            {/* Thumb */}
            <rect
              x="36"
              y="46"
              width="12"
              height="19"
              rx="6"
              transform="rotate(-18 42 55)"
              fill="#b83b37"
            />
            {/* Main Glove Pad */}
            <rect x="42" y="45" width="35" height="27" rx="8" fill="#d9534f" />
            {/* Inner Shading on Glove */}
            <path
              d="M 46,60 Q 60,65 73,60 L 73,70 Q 60,73 46,70 Z"
              fill="#c03f3b"
            />
            {/* Wrist Strap */}
            <rect x="46" y="71" width="27" height="15" rx="3" fill="#c94642" />
            <rect x="46" y="71" width="27" height="4" fill="#b03632" />
          </g>
        </svg>
      )}

      {moduleId === 'advanced-text-fu' && (
        <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-md">
          <defs>
            <clipPath id="clip-adv-text-fu">
              <circle cx="60" cy="60" r="56" />
            </clipPath>
          </defs>
          <g clipPath="url(#clip-adv-text-fu)">
            {/* Steel Blue Circle Base */}
            <circle cx="60" cy="60" r="56" fill="#26739d" />
            {/* 45-degree Long Shadow */}
            <polygon
              points="44,86 76,34 132,90 90,132"
              fill="#000000"
              opacity="0.2"
            />
            {/* Martial Arts Glove (Golden Yellow) */}
            {/* Fingers */}
            <rect x="44" y="34" width="7.5" height="18" rx="3.75" fill="#dfa11b" />
            <rect x="52.5" y="32" width="7.5" height="20" rx="3.75" fill="#f3b629" />
            <rect x="61" y="33" width="7.5" height="19" rx="3.75" fill="#f3b629" />
            <rect x="69.5" y="36" width="7.5" height="17" rx="3.75" fill="#dfa11b" />
            {/* Thumb */}
            <rect
              x="36"
              y="46"
              width="12"
              height="19"
              rx="6"
              transform="rotate(-18 42 55)"
              fill="#c98e12"
            />
            {/* Main Glove Pad */}
            <rect x="42" y="45" width="35" height="27" rx="8" fill="#f3b629" />
            {/* Inner Shading */}
            <path
              d="M 46,60 Q 60,65 73,60 L 73,70 Q 60,73 46,70 Z"
              fill="#d99b16"
            />
            {/* Wrist Strap */}
            <rect x="46" y="71" width="27" height="15" rx="3" fill="#dfa11b" />
            <rect x="46" y="71" width="27" height="4" fill="#c4890e" />
          </g>
        </svg>
      )}

      {moduleId === 'user-management' && (
        <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-md">
          <defs>
            <clipPath id="clip-user-mgmt">
              <circle cx="60" cy="60" r="56" />
            </clipPath>
          </defs>
          <g clipPath="url(#clip-user-mgmt)">
            {/* Olive Green Circle Base */}
            <circle cx="60" cy="60" r="56" fill="#7c9a3d" />
            {/* 45-degree Long Shadow */}
            <polygon
              points="36,80 78,40 130,92 88,132"
              fill="#000000"
              opacity="0.18"
            />
            {/* Tux Penguin Outer Body */}
            <path
              d="M 35,80 C 35,46 44,36 60,36 C 76,36 85,46 85,80 Z"
              fill="#2b3035"
            />
            {/* Tux White Face & Belly */}
            <path
              d="M 43,80 C 43,56 47,48 53,48 C 56,48 58,52 60,52 C 62,52 64,48 67,48 C 73,48 77,56 77,80 Z"
              fill="#f4f5f7"
            />
            {/* Eyes */}
            <circle cx="52" cy="56" r="3" fill="#2b3035" />
            <circle cx="68" cy="56" r="3" fill="#2b3035" />
            <circle cx="51.2" cy="55.2" r="1" fill="#ffffff" />
            <circle cx="67.2" cy="55.2" r="1" fill="#ffffff" />
            {/* Golden Beak */}
            <polygon points="52,62 68,62 60,71" fill="#f5b324" />
          </g>
        </svg>
      )}

      {moduleId === 'permissions' && (
        <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-md">
          <defs>
            <clipPath id="clip-permissions">
              <circle cx="60" cy="60" r="56" />
            </clipPath>
          </defs>
          <g clipPath="url(#clip-permissions)">
            {/* Teal Emerald Circle Base */}
            <circle cx="60" cy="60" r="56" fill="#149b76" />
            {/* 45-degree Long Shadow */}
            <polygon
              points="40,84 74,36 132,94 88,134"
              fill="#000000"
              opacity="0.18"
            />
            {/* Lock Shackle */}
            <path
              d="M 47,54 L 47,43 C 47,35 53,31 60,31 C 67,31 73,35 73,43 L 73,54"
              fill="none"
              stroke="#eef2f6"
              strokeWidth="6.5"
              strokeLinecap="round"
            />
            {/* Lock Body Base (Yellow) */}
            <rect x="39" y="51" width="42" height="34" rx="5" fill="#f5c832" />
            {/* Right Half Shading on Lock Body */}
            <path
              d="M 60,51 L 76,51 Q 81,51 81,56 L 81,80 Q 81,85 76,85 L 60,85 Z"
              fill="#e2b221"
            />
            {/* Keyhole */}
            <circle cx="60" cy="65" r="4.2" fill="#149b76" />
            <polygon points="58,67 62,67 63,75 57,75" fill="#149b76" />
          </g>
        </svg>
      )}

      {moduleId === 'processes' && (
        <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-md">
          <defs>
            <clipPath id="clip-processes">
              <circle cx="60" cy="60" r="56" />
            </clipPath>
          </defs>
          <g clipPath="url(#clip-processes)">
            {/* Mustard Gold Circle Base */}
            <circle cx="60" cy="60" r="56" fill="#deb221" />
            {/* 45-degree Long Shadow */}
            <polygon
              points="38,65 65,30 132,96 92,132"
              fill="#000000"
              opacity="0.17"
            />
            {/* Top-Left Gear */}
            <g transform="translate(52, 46)">
              {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
                <rect
                  key={deg}
                  x="-3.5"
                  y="-19"
                  width="7"
                  height="38"
                  rx="1.5"
                  fill="#b4bcc2"
                  transform={`rotate(${deg})`}
                />
              ))}
              <circle cx="0" cy="0" r="14.5" fill="#b4bcc2" />
              <circle cx="0" cy="0" r="6" fill="#deb221" />
            </g>
            {/* Bottom-Right Gear */}
            <g transform="translate(68, 74)">
              {[22.5, 67.5, 112.5, 157.5, 202.5, 247.5, 292.5, 337.5].map((deg) => (
                <rect
                  key={deg}
                  x="-3"
                  y="-15"
                  width="6"
                  height="30"
                  rx="1.5"
                  fill="#9ba4ab"
                  transform={`rotate(${deg})`}
                />
              ))}
              <circle cx="0" cy="0" r="11.5" fill="#9ba4ab" />
              <circle cx="0" cy="0" r="4.8" fill="#deb221" />
            </g>
          </g>
        </svg>
      )}

      {moduleId === 'packages' && (
        <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-md">
          <defs>
            <clipPath id="clip-packages">
              <circle cx="60" cy="60" r="56" />
            </clipPath>
          </defs>
          <g clipPath="url(#clip-packages)">
            {/* Lavender Purple Circle Base */}
            <circle cx="60" cy="60" r="56" fill="#7c78a6" />
            {/* 45-degree Long Shadow */}
            <polygon
              points="37,74 83,46 134,97 88,134"
              fill="#000000"
              opacity="0.18"
            />
            {/* Isometric Box Top Face */}
            <polygon
              points="60,33 84,46 60,59 36,46"
              fill="#e6bf8b"
            />
            {/* Isometric Box Left Face */}
            <polygon
              points="36,46 60,59 60,86 36,73"
              fill="#d3a36c"
            />
            {/* Isometric Box Right Face */}
            <polygon
              points="60,59 84,46 84,73 60,86"
              fill="#b5834d"
            />
            {/* Packing Tape Strip across Top & Side */}
            <polygon
              points="47,39.5 73,53.5 68,56.2 42,42.2"
              fill="#f5dfb9"
              opacity="0.75"
            />
            <polygon
              points="68,55 73,52.5 73,61 68,63.5"
              fill="#dfcaa5"
              opacity="0.65"
            />
          </g>
        </svg>
      )}
    </div>
  );
};
