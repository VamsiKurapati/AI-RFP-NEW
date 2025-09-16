import React from "react";
import Abstract from "../../assets/superAdmin/Abstract.png";

const Card = ({ title, items }) => (
    <div className="h-[255px] w-[275px] rounded-2xl shadow-lg border border-[#6C63FF] overflow-hidden">
        {/* Header */}
        <div className="bg-white px-4 py-2">
            <h2 className="text-lg font-semibold text-[#6C63FF]">{title}</h2>
        </div>

        {/* Gradient Body */}
        <div className="relative h-full p-4 bg-gradient-to-b from-[#6C63FF] to-[#413B99]/80">
            {/* Background Image */}
            <img
                src={Abstract}
                alt="Abstract"
                className="absolute inset-0 w-[275px] h-[210px] object-cover"
            />

            {/* Content on top */}
            <div className="relative z-10 flex flex-wrap gap-1">
                {items.map((item, index) => (
                    <span
                        key={index}
                        className="inline-flex h-[26px] items-center whitespace-nowrap bg-white text-[#6C63FF] font-medium text-sm px-3 py-2 rounded-full shadow-sm"
                    >
                        {item}
                    </span>
                ))}
            </div>
        </div>

    </div>
);

export default Card;