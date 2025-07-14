import React from 'react';

type Move = {
  san: string;
  children: Move[];
};

interface MoveHistoryProps {
  theme: 'dark' | 'light';
  moveTree: Move[];
  currentPath: number[];
  onNavigate: (path: number[]) => void;
}

export const MoveHistory: React.FC<MoveHistoryProps> = ({
  theme,
  moveTree,
  currentPath,
  onNavigate,
}) => {
  if (moveTree.length === 0) {
    return (
      <div 
        data-testid="movehistory"
        style={{
          width: '100%',
          maxWidth: '500px',
          height: '200px',
          border: `1px solid ${theme === 'dark' ? '#333' : '#e0e0e0'}` ,
          borderRadius: '12px',
          padding: '1.5rem',
          backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
          color: theme === 'dark' ? '#ffffff' : '#000000',
          overflowY: 'auto',
          fontSize: '14px',
          fontFamily: 'monospace',
          boxShadow: theme === 'dark' 
            ? '0 4px 12px rgba(0, 0, 0, 0.3)' 
            : '0 4px 12px rgba(0, 0, 0, 0.1)',
        }}
      >
        <div style={{ color: theme === 'dark' ? '#666' : '#999', fontStyle: 'italic', fontSize: '13px' }}>
          No moves yet
        </div>
      </div>
    );
  }

  const isCurrent = (path: number[]) => currentPath.length === path.length && path.every((v, i) => v === currentPath[i]);

  const renderVariation = (node: Move, mn: number, isBlack: boolean, path: number[], isStart: boolean = true) => {
    let prefix = '';
    if (isStart) {
      prefix = isBlack ? `${mn}... ` : `${mn}. `;
    } else if (!isBlack) {
      prefix = `${mn}. `;
    } else {
      prefix = '';
    }
    const moveSpan = (
      <span 
        key={path.join('-')} 
        onClick={() => onNavigate(path)}
        style={{
          cursor: 'pointer',
          backgroundColor: isCurrent(path) ? (theme === 'dark' ? 'rgba(255, 255, 0, 0.3)' : 'rgba(255, 215, 0, 0.4)') : 'transparent',
          padding: '1px 3px',
          borderRadius: '3px'
        }}
      >
        {prefix}{node.san}
      </span>
    );

    const contents: React.ReactNode[] = [moveSpan];

    for (let v = 1; v < node.children.length; v++) {
      const subIsBlack = !isBlack;
      const subMn = isBlack ? mn + 1 : mn;
      const subContent = renderVariation(node.children[v], subMn, subIsBlack, [...path, v], true);
      contents.push(<> ( {subContent} ) </>);
    }

    if (node.children[0]) {
      const subIsBlack = !isBlack;
      const subMn = isBlack ? mn + 1 : mn;
      const mainCont = renderVariation(node.children[0], subMn, subIsBlack, [...path, 0], false);
      contents.push(<> {mainCont} </>);
    }

    return <>{contents}</>;
  };

  const rows: React.ReactNode[] = [];

  let mn = 1;
  let path: number[] = [];
  let children = moveTree;

  while (children[0]) {
    const whiteIndex = 0;
    const whiteNode = children[whiteIndex];
    const whitePath = [...path, whiteIndex];

    let blackNode: Move | undefined = undefined;
    let blackPath: number[] | undefined = undefined;
    if (whiteNode.children[0]) {
      const blackIndex = 0;
      blackNode = whiteNode.children[blackIndex];
      blackPath = [...whitePath, blackIndex];
    }

    rows.push(
      <tr key={mn} style={{ marginBottom: '4px', lineHeight: '1.4' }}>
        <td style={{ width: '40px', paddingRight: '12px', color: theme === 'dark' ? '#888' : '#666', textAlign: 'right' }}>
          {mn}.
        </td>
        <td style={{ width: '80px', paddingRight: '12px' }}>
          <span
            onClick={() => onNavigate(whitePath)}
            style={{
              color: theme === 'dark' ? '#ffffff' : '#000000',
              backgroundColor: isCurrent(whitePath) ? (theme === 'dark' ? 'rgba(255, 255, 0, 0.3)' : 'rgba(255, 215, 0, 0.4)') : 'transparent',
              padding: '1px 3px',
              borderRadius: '3px',
              cursor: 'pointer'
            }}
          >
            {whiteNode.san}
          </span>
        </td>
        <td style={{ width: '80px' }}>
          {blackNode ? (
            <span
              onClick={() => onNavigate(blackPath!)}
              style={{
                color: theme === 'dark' ? '#ffffff' : '#000000',
                backgroundColor: isCurrent(blackPath!) ? (theme === 'dark' ? 'rgba(255, 255, 0, 0.3)' : 'rgba(255, 215, 0, 0.4)') : 'transparent',
                padding: '1px 3px',
                borderRadius: '3px',
                cursor: 'pointer'
              }}
            >
              {blackNode.san}
            </span>
          ) : null}
        </td>
      </tr>
    );

    for (let v = 1; v < whiteNode.children.length; v++) {
      const varContent = renderVariation(whiteNode.children[v], mn, true, [...whitePath, v]);
      rows.push(
        <tr key={`var-w-${mn}-${v}`} >
          <td colSpan={3} style={{ paddingLeft: '20px', color: theme === 'dark' ? '#aaa' : '#555' }}>
            ( {varContent} )
          </td>
        </tr>
      );
    }

    if (!blackNode) break;

    for (let v = 1; v < blackNode.children.length; v++) {
      const varContent = renderVariation(blackNode.children[v], mn + 1, false, [...blackPath!, v]);
      rows.push(
        <tr key={`var-b-${mn}-${v}`} >
          <td colSpan={3} style={{ paddingLeft: '20px', color: theme === 'dark' ? '#aaa' : '#555' }}>
            ( {varContent} )
          </td>
        </tr>
      );
    }

    children = blackNode.children;
    path = blackPath!;
    mn++;
  }

  return (
    <div 
      data-testid="movehistory"
      style={{
        width: '100%',
        maxWidth: '500px',
        height: '200px',
        border: `1px solid ${theme === 'dark' ? '#333' : '#e0e0e0'}` ,
        borderRadius: '12px',
        padding: '1.5rem',
        backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
        color: theme === 'dark' ? '#ffffff' : '#000000',
        overflowY: 'auto',
        fontSize: '14px',
        fontFamily: 'monospace',
        boxShadow: theme === 'dark' 
          ? '0 4px 12px rgba(0, 0, 0, 0.3)' 
          : '0 4px 12px rgba(0, 0, 0, 0.1)',
      }}
    >
      <table style={{ width: '100%' }}>
        <tbody>
          {rows}
        </tbody>
      </table>
    </div>
  );
};
