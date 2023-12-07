package db

import sq "github.com/Masterminds/squirrel"

type QueryOption sq.Sqlizer

type OrderQueryOption struct {
	Column string
	Desc   bool
}

func (o OrderQueryOption) ToSql() (string, []any, error) {
	sql := o.Column
	if o.Desc {
		return sql + " DESC", nil, nil
	}
	return sql + " ASC", nil, nil
}
