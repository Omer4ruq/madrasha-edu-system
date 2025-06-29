  const selectStyles = {
    control: (base) => ({
      ...base,
      background: 'transparent',
      borderColor: '#9d9087',
      borderRadius: '8px',
      paddingLeft: '0.75rem',
      padding: '3px',
      color: '#441a05',
      fontFamily: "'Noto Sans Bengali', sans-serif",
      fontSize: '16px',
      transition: 'all 0.3s ease',
      '&:hover': { borderColor: '#441a05' },
      '&:focus': { outline: 'none', boxShadow: 'none' },
    }),
    placeholder: (base) => ({
      ...base,
      color: '#441a05',
      opacity: 0.7,
      fontFamily: "'Noto Sans Bengali', sans-serif",
      fontSize: '16px',
    }),
    singleValue: (base) => ({
      ...base,
      color: '#441a05',
      fontFamily: "'Noto Sans Bengali', sans-serif",
      fontSize: '16px',
    }),
    input: (base) => ({
      ...base,
      color: '#441a05',
      fontFamily: "'Noto Sans Bengali', sans-serif",
      fontSize: '16px',
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: 'rgba(255, 255, 255, 0.6)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '8px',
      zIndex: 9999,
      marginTop: '4px',
    }),
    menuPortal: (base) => ({
      ...base,
      zIndex: 9999,
    }),
    option: (base, { isFocused, isSelected }) => ({
      ...base,
      color: '#441a05',
      fontFamily: "'Noto Sans Bengali', sans-serif",
      fontSize: '16px',
      backgroundColor: isSelected ? '#DB9E30' : isFocused ? 'rgba(255, 255, 255)' : 'transparent',
      cursor: 'pointer',
      '&:active': { backgroundColor: '#DB9E30' },
    }),
  };


  export default selectStyles;