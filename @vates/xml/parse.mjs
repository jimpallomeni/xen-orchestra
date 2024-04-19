import sax from 'sax'

export function parse(xml, { normalize = true, strict = true, trim = true } = {}) {
  const stack = [{ children: [] }]

  const parser = sax.parser(strict, { normalize, trim })
  parser.ontext = text => {
    stack[stack.length - 1].children.push(text)
  }
  parser.onopentag = ({ name, attributes }) => {
    const node = { name, attributes, children: [] }
    stack[stack.length - 1].children.push(node)
    stack.push(node)
  }
  parser.onclosetag = () => {
    stack.pop()
  }

  parser.write(xml).close()

  return stack[0].children[0]
}

export function parse2(xml, { normalize = true, strict = true, trim = true }) {
  const stack = [{}]

  const parser = sax.parser(strict, { normalize, trim })
  parser.ontext = text => {
    stack[stack.length - 1].children.push(text)
  }
  parser.onopentag = ({ name, attributes }) => {
    const node = { name, attributes, children: [] }

    const parent = stack[stack.length - 1]
    if (Object.has(node, name)) {
      if ()
    }

    stack[stack.length - 1].children.push(node)
    stack.push(node)
  }
  parser.onclosetag = () => {
    stack.pop()
  }

  parser.write(xml).close()

  return stack[0].children[0]
}
