import './global.css'

import PropTypes from 'prop-types'
import { identity, path } from 'ramda'
import React, { Component, Fragment } from 'react'
import ProductSummary from 'vtex.product-summary/index'
import { injectIntl, intlShape } from 'react-intl'
import { productListSchemaPropTypes } from './propTypes'
import ScrollTypes, { getScrollNames, getScrollValues } from './ScrollTypes'
import ShelfContent from './ShelfContent'

const DEFAULT_MAX_ITEMS = 10
const DEFAULT_ITEMS_PER_PAGE = 5

function normalizeBuyable(product) {
  const items = path(['items'], product)
  const buyableItems =
    path(['length'], items) &&
    items
      .map(item => ({
        ...item,
        sellers: getBuyableSellers(item.sellers),
      }))
      .filter(item => path(['sellers', 'length'], item))

  return buyableItems
    ? {
      ...product,
      items: buyableItems,
    }
    : null
}

function getBuyableSellers(sellers) {
  return (
    path(['length'], sellers) &&
    sellers.filter(
      seller =>
        path(['sellerId'], seller)
    )
  )
}

/**
 * Product List Component. Shows a collection of products.
 */
class ProductList extends Component {
  render() {
    const {
      products,
      maxItems,
      titleText,
      arrows,
      scroll,
      itemsPerPage,
      summary,
      isMobile,
      intl,
    } = this.props

    const filteredProducts =
      products && products.map(normalizeBuyable).filter(identity)

    return products && !products.length ? null : (
      <Fragment>
        <h1 className="vtex-shelf__title t-heading-2 fw3 w-100 flex justify-center pt6 pb6 c-muted-1 mv0">
          {titleText || intl.formatMessage({ id: 'shelf.title' })}
        </h1>
        <ShelfContent
          products={filteredProducts}
          maxItems={maxItems}
          arrows={arrows}
          scroll={scroll}
          itemsPerPage={itemsPerPage}
          summary={summary}
          isMobile={isMobile}
        />
      </Fragment>
    )
  }
}

ProductList.getSchema = props => {
  return {
    title: 'editor.shelf.title',
    description: 'editor.shelf.description',
    type: 'object',
    properties: {
      maxItems: {
        title: 'editor.shelf.maxItems.title',
        type: 'number',
        default: ProductList.defaultProps.maxItems,
        isLayout: true,
      },
      itemsPerPage: {
        title: 'editor.shelf.itemsPerPage.title',
        type: 'number',
        enum: [3, 4, 5],
        default: ProductList.defaultProps.itemsPerPage,
        isLayout: true,
      },
      scroll: {
        title: 'editor.shelf.scrollType.title',
        type: 'string',
        enum: getScrollValues(),
        enumNames: getScrollNames(),
        default: ScrollTypes.BY_PAGE.value,
        isLayout: true,
      },
      arrows: {
        title: 'editor.shelf.arrows.title',
        type: 'boolean',
        default: ProductList.defaultProps.arrows,
        isLayout: true,
      },
      titleText: {
        title: 'editor.shelf.titleText.title',
        type: 'string',
        default: ProductList.defaultProps.titleText,
        isLayout: false,
      },
      summary: {
        title: 'editor.shelf.summary.title',
        type: 'object',
        properties: ProductSummary.getSchema(props).properties,
      }
    },
  }
}

ProductList.defaultProps = {
  maxItems: DEFAULT_MAX_ITEMS,
  itemsPerPage: DEFAULT_ITEMS_PER_PAGE,
  scroll: ScrollTypes.BY_PAGE.value,
  arrows: true,
  titleText: null,
  isMobile: false,
}

ProductList.propTypes = {
  /** Loading status */
  loading: PropTypes.bool,
  /** Graphql data response. */
  products: ShelfContent.propTypes.products,
  /** Verifies if is a mobile device. */
  isMobile: PropTypes.bool,
  /** Internacionalization */
  intl: intlShape.isRequired,
  ...productListSchemaPropTypes,
}

export const defaultProps = ProductList.defaultProps
export default injectIntl(ProductList)