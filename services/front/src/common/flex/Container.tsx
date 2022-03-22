import React from 'react'

type Props = {
  children: React.ReactNode,
  style?: React.CSSProperties,
}

const Container = ({
  children,
  style,
}: Props) => {
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        width: '100%',
        ...style,
      }}>
      {children}
    </div>
  )
}

export default Container
