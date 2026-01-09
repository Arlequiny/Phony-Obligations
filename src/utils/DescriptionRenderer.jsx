import React from 'react';

const KEYWORDS = [
    "Taunt", "Stealth", "Glass Frame", "Insensate",
    "Double Attack", "Perishing", "Battlecry", "Deathrattle"
];

export default function DescriptionRenderer({ text, style }) {
    if (!text) return null;
    const regex = new RegExp(`(${KEYWORDS.join('|')})`, 'gi');
    const parts = text.split(regex);

    return (
        <span style={style}>
            {parts.map((part, index) => {
                const isKeyword = KEYWORDS.some(k => k.toLowerCase() === part.toLowerCase());

                return isKeyword ? (
                    <span key={index} style={{ color: '#f1c40f', fontWeight: 'bold', textShadow: '0 0 2px black, 0 0 1px black' }}>
                        {part}
                    </span>
                ) : (
                    part
                );
            })}
        </span>
    );
}