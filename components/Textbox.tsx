import React from "react";

export default function Textbox({
  className,
  children,
  labelText,
  type = "text",
  error,
  ...props
}) {
  return (
    <div className={className + " relative"}>
      {labelText && (
        <label
          className="block text-gray-600  mb-2 text-xs lg:text-sm xl:text-base"
          htmlFor="txt"
        >
          {labelText}
        </label>
      )}
      <div className="flex items-stretch">
        <input
          id="txt"
          autoComplete="off"
          className={`border border-slate-400 disabled:border-slate-100 w-full block outline-none py-2 px-1 transition-all text-xs lg:text-sm xl:text-base  bg-slate-50 focus:shadow focus:shadow-blue-500
              ${error && "border-red-500 border  animate-shake"} ${
            children ? "rounded-r-md" : "rounded-md"
          }`}
          {...props}
          required={true}
          type={type}
        ></input>

        <div className="flex">{children}</div>
      </div>
      {error && (
        <p className="text-red-600 text-right animate-shake">{error}</p>
      )}
    </div>
  );
}
