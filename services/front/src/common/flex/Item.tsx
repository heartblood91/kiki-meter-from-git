import React from 'react'

type Props = {
  children: React.ReactElement,
  style?: React.CSSProperties,

  xs?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12,
}

const Item = ({
  children,
  style,
  xs = 12,
}: Props) => {
  const unit_percent = 100 / 12

  const flex_size: React.CSSProperties = React.useMemo(() => {
    return {
      flexBasis: `${xs * unit_percent}%`,
      maxWidth: `${xs * unit_percent}%`,
    }

  }, [unit_percent, xs])

  return (
    <div style={{
      flex: '0 1 auto',
      padding: '0 10px 10px 0',
      ...flex_size,
      ...style,
    }}>
      {children}
    </div>
  )
}

export default Item
