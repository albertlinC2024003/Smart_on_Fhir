import { Button } from '@mui/material'

interface Props {
  variant?: 'text' | 'outlined' | 'contained'
  disabled?: boolean
  text: string
  disableRipple?: boolean
  type?: 'button' | 'submit'
  className?: string
  onClick?: (event?: React.MouseEvent<HTMLButtonElement>) => void
}

const CustomButton = ({
  variant = 'outlined',
  disabled = false,
  text,
  disableRipple = true,
  type = 'button',
  className,
  onClick = () => {},
  ...rest
}: Props) => {
  const dynamicClassName = `border-solid ${
    disabled ? 'border-emr-500' : 'border-emr-100'
  } ${className}`

  return (
    <Button
      variant={variant}
      disabled={disabled}
      disableRipple={disableRipple}
      type={type}
      className={dynamicClassName}
      onClick={onClick}
      {...rest}
    >
      <span className="text-xs">{text}</span>
    </Button>
  )
}

export default CustomButton
