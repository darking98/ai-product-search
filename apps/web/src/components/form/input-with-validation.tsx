import { useFormContext } from 'react-hook-form'
import Input, { InputProps } from '@/ui/form/input'

interface InputWithValidationProps extends InputProps {
  name: string
}

const InputWithValidation = ({ name, ...rest }: InputWithValidationProps) => {
  const { register, formState } = useFormContext()

  return (
    <div className="flex flex-col">
      <Input
        id={name}
        isError={formState.errors[name] ? true : false}
        {...register(name, {
          valueAsNumber: rest.type === 'number'
        })}
        {...rest}
      />
      {formState.errors[name] && (
        <p className="text-red-500 text-sm font-medium">
          {formState.errors[name].message as string}
        </p>
      )}
    </div>
  )
}

export default InputWithValidation
