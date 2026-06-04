import { forwardRef } from 'react'

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  isError?: boolean
  inputClassName?: string
  labelClassName?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      name,
      placeholder,
      inputClassName,
      isError,
      labelClassName,
      ...rest
    },
    ref
  ) => {
    return (
      <div className="flex flex-col gap-0.5">
        {label && (
          <label
            htmlFor={name}
            className={`text-xs text-white/85 ${labelClassName ?? ''}`}
          >
            {label}
          </label>
        )}
        <input
          type="text"
          ref={ref}
          name={name}
          id={name}
          placeholder={placeholder}
          className={`input outline-none border border-gray-100/20 placeholder:text-sm focus:border-gray-400/60 transition-all duration-300 bg-base-100! ${isError ? 'input-error' : ''} ${inputClassName ?? ''}`}
          {...rest}
        />
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input
